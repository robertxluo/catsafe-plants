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
    expect(screen.getByRole('button', { name: /plant directory/i })).toBeTruthy();
    expect(screen.getByText(/browse all/i)).toBeTruthy();

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
});
