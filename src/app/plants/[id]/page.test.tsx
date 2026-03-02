import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PlantDetailPage from '@/src/app/plants/[id]/page';
import { loadPlants } from '@/src/lib/load-plants';
import { plants as mockPlants } from '@/src/lib/plants';

const { mockPush, mockUseParams, mockUseSearchParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUseParams: vi.fn(),
  mockUseSearchParams: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: mockUseParams,
  useSearchParams: mockUseSearchParams,
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/src/lib/load-plants', () => ({
  loadPlants: vi.fn(),
}));

const mockedLoadPlants = vi.mocked(loadPlants);

function makeSearchParams(returnTo: string | null = null) {
  return {
    get: (key: string) => {
      if (key === 'returnTo') return returnTo;
      return null;
    },
  };
}

describe('PlantDetailPage route', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mockPush.mockReset();
    mockUseParams.mockReset();
    mockUseSearchParams.mockReset();
    mockUseParams.mockReturnValue({ id: 'lilium' });
    mockUseSearchParams.mockReturnValue(makeSearchParams());

    mockedLoadPlants.mockReset();
    mockedLoadPlants.mockResolvedValue(mockPlants);
  });

  it('renders detail view for a valid plant id', async () => {
    render(<PlantDetailPage />);

    expect(await screen.findByRole('heading', { name: /lily/i })).toBeTruthy();
    expect(screen.getByText(/highly toxic/i)).toBeTruthy();
    expect(screen.getByText(/not a substitute for professional veterinary care/i)).toBeTruthy();
  });

  it('defaults the back action to the directory when returnTo is missing', async () => {
    render(<PlantDetailPage />);

    expect(await screen.findByRole('heading', { name: /lily/i })).toBeTruthy();

    fireEvent.click(screen.getAllByRole('button', { name: /back to directory/i })[0]);
    expect(mockPush).toHaveBeenCalledWith('/plants');
  });

  it('uses home-origin returnTo for back while keeping Home and Directory explicit', async () => {
    mockUseSearchParams.mockReturnValue(makeSearchParams('/'));

    render(<PlantDetailPage />);

    expect(await screen.findByRole('heading', { name: /lily/i })).toBeTruthy();

    fireEvent.click(screen.getAllByRole('button', { name: /back to home/i })[0]);
    expect(mockPush).toHaveBeenCalledWith('/');

    fireEvent.click(screen.getByRole('button', { name: /^home$/i }));
    expect(mockPush).toHaveBeenCalledWith('/');

    fireEvent.click(screen.getByRole('button', { name: /plant directory/i }));
    expect(mockPush).toHaveBeenCalledWith('/plants');
  });

  it('preserves the exact directory state in the back action', async () => {
    mockUseSearchParams.mockReturnValue(makeSearchParams('/plants?q=orchid&page=2'));

    render(<PlantDetailPage />);

    expect(await screen.findByRole('heading', { name: /lily/i })).toBeTruthy();

    fireEvent.click(screen.getAllByRole('button', { name: /back to directory/i })[0]);
    expect(mockPush).toHaveBeenCalledWith('/plants?q=orchid&page=2');
  });

  it('does not mark top-level nav items active on detail pages', async () => {
    render(<PlantDetailPage />);

    expect(await screen.findByRole('heading', { name: /lily/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^home$/i }).getAttribute('aria-current')).toBeNull();
    expect(screen.getByRole('button', { name: /plant directory/i }).getAttribute('aria-current')).toBeNull();
  });

  it('preserves returnTo when opening an alternative from details', async () => {
    mockUseSearchParams.mockReturnValue(makeSearchParams('/plants?q=orchid&page=2'));

    render(<PlantDetailPage />);

    fireEvent.click(await screen.findByRole('button', { name: /spider plant/i }));

    expect(mockPush).toHaveBeenCalledWith('/plants/spider-plant?returnTo=%2Fplants%3Fq%3Dorchid%26page%3D2');
  });

  it('sanitizes invalid returnTo values back to the directory', async () => {
    mockUseSearchParams.mockReturnValue(makeSearchParams('https://example.com'));

    render(<PlantDetailPage />);

    expect(await screen.findByRole('heading', { name: /lily/i })).toBeTruthy();

    fireEvent.click(screen.getAllByRole('button', { name: /back to directory/i })[0]);
    expect(mockPush).toHaveBeenCalledWith('/plants');
  });

  it('renders graceful not-found state with directory fallback copy for an invalid plant id', async () => {
    mockUseParams.mockReturnValue({ id: 'not-real' });

    render(<PlantDetailPage />);

    expect(await screen.findByText(/plant not found\./i)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /back to directory/i }).length).toBeGreaterThan(0);
  });
});
