import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HomeView } from '@/src/components/home-view';
import { loadPlants } from '@/src/lib/load-plants';
import type { Plant } from '@/src/lib/plants';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}));

vi.mock('@/src/lib/load-plants', () => ({
  loadPlants: vi.fn(),
}));

const mockedLoadPlants = vi.mocked(loadPlants);

describe('HomeView', () => {
  beforeEach(() => {
    mockedLoadPlants.mockResolvedValue([]);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the hero and search input in jsdom', async () => {
    render(<HomeView onSelectPlant={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /keep your cat safe\./i })).toBeTruthy();
    expect(screen.getByLabelText(/search plants by name/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /home/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /directory/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /browse all/i })).toBeTruthy();
    expect(screen.getByText(/informational only\./i)).toBeTruthy();

    await waitFor(() => {
      expect(mockedLoadPlants).toHaveBeenCalledTimes(1);
    });
  });

  it('shows unknown status and evidence-incomplete label for uncited plants', async () => {
    const uncitedPlant: Plant = {
      id: 'uncited-safe',
      common_name: 'Uncited Safe',
      scientific_name: 'Safeus unsourcedii',
      aka_names: [],
      flower_colors: ['green'],
      primary_image_url: null,
      photo_urls: [],
      safety_status: 'non_toxic',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [],
    };

    mockedLoadPlants.mockResolvedValueOnce([uncitedPlant]);

    render(<HomeView onSelectPlant={vi.fn()} />);

    const input = await screen.findByLabelText(/search plants by name/i);
    fireEvent.change(input, { target: { value: 'uncited' } });

    expect(await screen.findByRole('listbox', { name: /plant search results/i })).toBeTruthy();
    expect(screen.getByText(/evidence incomplete/i)).toBeTruthy();
    expect(screen.getAllByText(/^unknown$/i).length).toBeGreaterThanOrEqual(1);
  });

  it('shows quick suggestions and fills search when clicked', async () => {
    const suggestedPlant: Plant = {
      id: 'suggested-plant',
      common_name: 'Prayer Plant',
      scientific_name: 'Maranta leuconeura',
      aka_names: [],
      flower_colors: ['pink'],
      primary_image_url: null,
      photo_urls: [],
      safety_status: 'non_toxic',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [],
    };

    mockedLoadPlants.mockResolvedValueOnce([suggestedPlant]);

    render(<HomeView onSelectPlant={vi.fn()} />);

    const matchingButtons = await screen.findAllByRole('button', { name: /prayer plant/i });
    expect(matchingButtons.length).toBeGreaterThan(0);

    fireEvent.click(matchingButtons[0]);

    const input = screen.getByLabelText(/search plants by name/i) as HTMLInputElement;
    expect(input.value).toBe('Prayer Plant');
  });

  it('supports keyboard navigation and enter-select in search results', async () => {
    const aloe: Plant = {
      id: 'aloe-id',
      common_name: 'Aloe',
      scientific_name: 'Aloe vera',
      aka_names: [],
      flower_colors: ['yellow'],
      primary_image_url: null,
      photo_urls: [],
      safety_status: 'mildly_toxic',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [{ source_name: 'ASPCA', source_url: 'https://example.com' }],
    };

    const areca: Plant = {
      id: 'areca-id',
      common_name: 'Areca Palm',
      scientific_name: 'Dypsis lutescens',
      aka_names: [],
      flower_colors: ['yellow'],
      primary_image_url: null,
      photo_urls: [],
      safety_status: 'non_toxic',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [{ source_name: 'ASPCA', source_url: 'https://example.com' }],
    };

    mockedLoadPlants.mockResolvedValueOnce([aloe, areca]);
    const onSelectPlant = vi.fn();
    render(<HomeView onSelectPlant={onSelectPlant} />);

    const input = await screen.findByLabelText(/search plants by name/i);
    fireEvent.change(input, { target: { value: 'a' } });

    const listbox = await screen.findByRole('listbox', { name: /plant search results/i });
    expect(listbox).toBeTruthy();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options[0].getAttribute('aria-selected')).toBe('true');
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options[1].getAttribute('aria-selected')).toBe('true');
    });

    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => {
      expect(onSelectPlant).toHaveBeenCalledWith('areca-id');
    });
  });

  it('closes search results when escape is pressed', async () => {
    const aloe: Plant = {
      id: 'aloe-id',
      common_name: 'Aloe',
      scientific_name: 'Aloe vera',
      aka_names: [],
      flower_colors: ['yellow'],
      primary_image_url: null,
      photo_urls: [],
      safety_status: 'mildly_toxic',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [{ source_name: 'ASPCA', source_url: 'https://example.com' }],
    };

    mockedLoadPlants.mockResolvedValueOnce([aloe]);
    render(<HomeView onSelectPlant={vi.fn()} />);

    const input = await screen.findByLabelText(/search plants by name/i);
    fireEvent.change(input, { target: { value: 'aloe' } });
    await screen.findByRole('listbox', { name: /plant search results/i });

    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('listbox', { name: /plant search results/i })).toBeNull();
    });
  });
});
