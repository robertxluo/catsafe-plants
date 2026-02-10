import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomeView } from '@/src/components/home-view';
import { loadPlants } from '@/src/lib/load-plants';

vi.mock('@/src/lib/load-plants', () => ({
  loadPlants: vi.fn(),
}));

const mockedLoadPlants = vi.mocked(loadPlants);

describe('HomeView', () => {
  beforeEach(() => {
    mockedLoadPlants.mockResolvedValue([]);
  });

  it('renders the hero and search input in jsdom', async () => {
    render(<HomeView onSelectPlant={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /keep your cat safe\./i })).toBeTruthy();
    expect(screen.getByLabelText(/search plants by name/i)).toBeTruthy();

    await waitFor(() => {
      expect(mockedLoadPlants).toHaveBeenCalledTimes(1);
    });
  });
});
