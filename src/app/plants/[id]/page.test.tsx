import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlantDetailPage from '@/src/app/plants/[id]/page';
import { loadPlants } from '@/src/lib/load-plants';
import { plants as mockPlants } from '@/src/lib/plants';

const { mockPush, mockUseParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUseParams: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: mockUseParams,
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/src/lib/load-plants', () => ({
  loadPlants: vi.fn(),
}));

const mockedLoadPlants = vi.mocked(loadPlants);

describe('PlantDetailPage route', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockUseParams.mockReset();
    mockUseParams.mockReturnValue({ id: 'lilium' });

    mockedLoadPlants.mockReset();
    mockedLoadPlants.mockResolvedValue(mockPlants);
  });

  it('renders detail view for a valid plant id', async () => {
    render(<PlantDetailPage />);

    expect(await screen.findByRole('heading', { name: /lily/i })).toBeTruthy();
    expect(screen.getByText(/highly toxic/i)).toBeTruthy();
    expect(screen.getByText(/not a substitute for professional veterinary care/i)).toBeTruthy();
  });

  it('renders graceful not-found state for an invalid plant id', async () => {
    mockUseParams.mockReturnValue({ id: 'not-real' });

    render(<PlantDetailPage />);

    expect(await screen.findByText(/plant not found\./i)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /back to search/i }).length).toBeGreaterThan(0);
  });
});
