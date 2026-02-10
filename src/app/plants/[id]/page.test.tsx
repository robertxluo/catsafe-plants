import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlantDetailPage from '@/src/app/plants/[id]/page';

const { mockPush, mockUseParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUseParams: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: mockUseParams,
  useRouter: () => ({ push: mockPush }),
}));

describe('PlantDetailPage route', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockUseParams.mockReset();
    mockUseParams.mockReturnValue({ id: 'lilium' });
  });

  it('renders detail view for a valid plant id', () => {
    render(<PlantDetailPage />);

    expect(screen.getByRole('heading', { name: /lily/i })).toBeTruthy();
    expect(screen.getByText(/highly toxic/i)).toBeTruthy();
    expect(screen.getByText(/not a substitute for professional veterinary care/i)).toBeTruthy();
  });

  it('renders graceful not-found state for an invalid plant id', () => {
    mockUseParams.mockReturnValue({ id: 'not-real' });

    render(<PlantDetailPage />);

    expect(screen.getByText(/plant not found\./i)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /back to search/i }).length).toBeGreaterThan(0);
  });
});
