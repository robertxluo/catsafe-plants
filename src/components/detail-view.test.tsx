import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DetailView } from '@/src/components/detail-view';
import { loadPlants } from '@/src/lib/load-plants';
import { plants as mockPlants, type Plant } from '@/src/lib/plants';

vi.mock('@/src/lib/load-plants', () => ({
  loadPlants: vi.fn(),
}));

const mockedLoadPlants = vi.mocked(loadPlants);

describe('DetailView', () => {
  beforeEach(() => {
    mockedLoadPlants.mockReset();
    mockedLoadPlants.mockResolvedValue(mockPlants);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders toxic symptoms and toxic parts when present', async () => {
    render(<DetailView plantId="lilium" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /lily/i })).toBeTruthy();
    expect(screen.getByText(/highly toxic/i)).toBeTruthy();
    expect(screen.getByRole('heading', { name: /symptoms/i })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /toxic parts/i })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /safe alternatives/i })).toBeTruthy();
    expect(screen.getByText(/not a substitute for professional veterinary care/i)).toBeTruthy();
  });

  it('renders evidence citations with labeled functional links when available', async () => {
    render(<DetailView plantId="lilium" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /evidence/i })).toBeTruthy();
    expect(screen.getByText(/aspca animal poison control - lily/i)).toBeTruthy();

    const sourceLinks = screen.getAllByRole('link', { name: /open source/i });
    expect(sourceLinks.length).toBeGreaterThan(0);
    expect(sourceLinks[0].getAttribute('href')).toBe(
      'https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/lily'
    );
  });

  it('renders disclaimer and hides toxic detail sections for unknown plants', async () => {
    render(<DetailView plantId="unknown-plant" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /unknown plant/i })).toBeTruthy();
    expect(screen.getByText(/unknown safety/i)).toBeTruthy();
    expect(screen.queryByRole('heading', { name: /symptoms/i })).toBeNull();
    expect(screen.queryByRole('heading', { name: /toxic parts/i })).toBeNull();

    const evidenceHeading = screen.getByRole('heading', { name: /evidence/i });
    const evidenceSection = evidenceHeading.closest('section');
    expect(evidenceSection).not.toBeNull();
    expect(within(evidenceSection as HTMLElement).getByText(/we do not currently have a source citation/i)).toBeTruthy();
    expect(within(evidenceSection as HTMLElement).getByText('Unknown')).toBeTruthy();
    expect(screen.queryByRole('link', { name: /open source/i })).toBeNull();
    expect(screen.queryByRole('heading', { name: /safe alternatives/i })).toBeNull();
    expect(screen.getByText(/not a substitute for professional veterinary care/i)).toBeTruthy();
  });

  it('uses cautious non-toxic wording instead of absolute safety language', async () => {
    render(<DetailView plantId="spider-plant" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(await screen.findByText(/currently regarded as non-toxic/i)).toBeTruthy();
    expect(screen.getByText(/individual reactions can vary/i)).toBeTruthy();
    expect(screen.queryByRole('heading', { name: /safe alternatives/i })).toBeNull();
  });

  it('gracefully hides empty toxic details when toxic fields are missing', async () => {
    const toxicMissingFieldsPlant: Plant = {
      id: 'toxic-missing-fields',
      common_name: 'Toxic Test Plant',
      scientific_name: 'Testus toxicus',
      aka_names: [],
      flower_colors: ['red'],
      primary_image_url: null,
      safety_status: 'highly_toxic',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [],
    };

    mockedLoadPlants.mockResolvedValueOnce([...mockPlants, toxicMissingFieldsPlant]);

    render(<DetailView plantId="toxic-missing-fields" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /toxic test plant/i })).toBeTruthy();
    expect(screen.getByText(/highly toxic/i)).toBeTruthy();
    expect(screen.queryByRole('heading', { name: /symptoms/i })).toBeNull();
    expect(screen.queryByRole('heading', { name: /toxic parts/i })).toBeNull();
    expect(screen.getByText(/not a substitute for professional veterinary care/i)).toBeTruthy();
  });

  it('opens selected alternative detail when an alternative card is clicked', async () => {
    const onSelectPlant = vi.fn();
    render(<DetailView plantId="lilium" onBack={vi.fn()} onSelectPlant={onSelectPlant} />);

    fireEvent.click(await screen.findByRole('button', { name: /spider plant/i }));

    expect(onSelectPlant).toHaveBeenCalledWith('spider-plant');
  });

  it('renders alternative image when present and placeholder when missing', async () => {
    render(<DetailView plantId="lilium" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(await screen.findByRole('img', { name: /spider plant photo/i })).toBeTruthy();
    expect(screen.getByTestId('alternative-placeholder-boston-fern')).toBeTruthy();
  });

  it('shows configuration/load error state and can retry successfully', async () => {
    mockedLoadPlants
      .mockRejectedValueOnce(
        new Error(
          'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.'
        )
      )
      .mockResolvedValueOnce(mockPlants);

    render(<DetailView plantId="lilium" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(await screen.findByText(/supabase is not configured/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /lily/i })).toBeTruthy();
    });

    expect(mockedLoadPlants).toHaveBeenCalledTimes(2);
  });
});
