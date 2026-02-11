import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlantsDirectoryView } from '@/src/components/plants-directory-view';
import { loadPlants } from '@/src/lib/load-plants';
import type { Plant } from '@/src/lib/plants';

const { mockPush, mockUsePathname, mockUseSearchParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUsePathname: vi.fn(),
  mockUseSearchParams: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: mockUsePathname,
  useSearchParams: mockUseSearchParams,
}));

vi.mock('@/src/lib/load-plants', () => ({
  loadPlants: vi.fn(),
}));

const mockedLoadPlants = vi.mocked(loadPlants);
const flowerColors = ['white', 'yellow', 'orange', 'red', 'pink', 'purple', 'blue', 'green'] as const;

function makePlants(count: number): Plant[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `plant-${index + 1}`,
    common_name: `Plant ${index + 1}`,
    scientific_name: `Plantus ${index + 1}`,
    aka_names: [],
    flower_colors: [flowerColors[index % flowerColors.length]],
    primary_image_url: index % 2 === 0 ? '/flower_placeholder.png' : null,
    safety_status: index % 3 === 0 ? 'non_toxic' : index % 3 === 1 ? 'mildly_toxic' : 'highly_toxic',
    symptoms: null,
    toxic_parts: null,
    alternatives: [],
    citations: [],
  }));
}

function makeSearchParams(page: string | null) {
  return {
    get: (key: string) => (key === 'page' ? page : null),
    toString: () => (page ? `page=${page}` : ''),
  };
}

function makeFilterPlants(): Plant[] {
  return [
    {
      id: 'safe-yellow',
      common_name: 'Safe Yellow',
      scientific_name: 'Safeus yellowii',
      aka_names: [],
      flower_colors: ['yellow'],
      primary_image_url: null,
      safety_status: 'non_toxic',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [],
    },
    {
      id: 'safe-blue',
      common_name: 'Safe Blue',
      scientific_name: 'Safeus blueii',
      aka_names: [],
      flower_colors: ['blue'],
      primary_image_url: null,
      safety_status: 'non_toxic',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [],
    },
    {
      id: 'toxic-yellow',
      common_name: 'Toxic Yellow',
      scientific_name: 'Toxicus yellowii',
      aka_names: [],
      flower_colors: ['yellow'],
      primary_image_url: null,
      safety_status: 'highly_toxic',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [],
    },
    {
      id: 'unknown-red',
      common_name: 'Unknown Red',
      scientific_name: 'Unknownus redii',
      aka_names: [],
      flower_colors: ['red'],
      primary_image_url: null,
      safety_status: 'unknown',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [],
    },
  ];
}

describe('PlantsDirectoryView', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mockPush.mockReset();
    mockUsePathname.mockReset();
    mockUseSearchParams.mockReset();
    mockedLoadPlants.mockReset();

    mockUsePathname.mockReturnValue('/plants');
    mockUseSearchParams.mockReturnValue(makeSearchParams(null));
  });

  it('shows a loading state while plant data is being fetched', async () => {
    let resolvePlants!: (value: Plant[]) => void;
    mockedLoadPlants.mockReturnValue(
      new Promise<Plant[]>((resolve) => {
        resolvePlants = resolve;
      })
    );

    render(<PlantsDirectoryView />);

    expect(screen.getByText(/loading plants\.\.\./i)).toBeTruthy();

    resolvePlants(makePlants(1));

    await waitFor(() => {
      expect(screen.queryByText(/loading plants\.\.\./i)).toBeNull();
    });
  });

  it('includes a back-to-search action that routes to home', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(5));

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back to search/i })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /back to search/i }));
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('renders 20 plants per page with pagination controls and page indicator', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(45));

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getByText(/page 1 of 3/i)).toBeTruthy();
    });

    expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(20);
    expect(screen.getByRole('button', { name: /previous/i }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: /next/i }).hasAttribute('disabled')).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(mockPush).toHaveBeenCalledWith('/plants?page=2');
  });

  it('supports boundary paging controls on middle and last pages', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(45));
    mockUseSearchParams.mockReturnValue(makeSearchParams('2'));

    const { rerender } = render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getByText(/page 2 of 3/i)).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(mockPush).toHaveBeenCalledWith('/plants');

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(mockPush).toHaveBeenCalledWith('/plants?page=3');

    mockUseSearchParams.mockReturnValue(makeSearchParams('3'));
    rerender(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getByText(/page 3 of 3/i)).toBeTruthy();
    });

    expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(5);
    expect(screen.getByRole('button', { name: /next/i }).hasAttribute('disabled')).toBe(true);
  });

  it('normalizes invalid page query values to page 1', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(45));
    mockUseSearchParams.mockReturnValue(makeSearchParams('invalid'));

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getByText(/page 1 of 3/i)).toBeTruthy();
    });
  });

  it('shows empty state when no plants are available', async () => {
    mockedLoadPlants.mockResolvedValue([]);

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getByText(/no plants available in the directory yet\./i)).toBeTruthy();
    });
  });

  it('shows an error state and retries successfully', async () => {
    mockedLoadPlants
      .mockRejectedValueOnce(new Error('Unable to load plant data. Please try again.'))
      .mockResolvedValueOnce(makePlants(3));

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getByText(/unable to load plant data\. please try again\./i)).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByText(/page 1 of 1/i)).toBeTruthy();
    });

    expect(mockedLoadPlants).toHaveBeenCalledTimes(2);
  });

  it('filters results by safety status', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(9));

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getByText(/page 1 of 1/i)).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /^safe only$/i }));

    expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(3);
  });

  it('filters results by flower color', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(10));

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getByText(/page 1 of 1/i)).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /^yellow$/i }));

    expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(2);
  });

  it('applies safety and color filters with AND logic', async () => {
    mockedLoadPlants.mockResolvedValue(makeFilterPlants());

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getByText(/page 1 of 1/i)).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /^safe only$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^yellow$/i }));

    expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(1);
    expect(screen.getByRole('button', { name: /open details for safe yellow/i })).toBeTruthy();
  });

  it('shows no-match state and resets filters', async () => {
    mockedLoadPlants.mockResolvedValue(makeFilterPlants());

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getByText(/page 1 of 1/i)).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /^toxic only$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^blue$/i }));

    expect(screen.getByText(/no plants match the selected safety and flower color filters\./i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /reset filters/i }));

    expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(4);
  });

  it('keeps pagination accurate when filters reduce result count', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(45));
    mockUseSearchParams.mockReturnValue(makeSearchParams('3'));

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getByText(/page 3 of 3/i)).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /^safe only$/i }));

    expect(screen.getByText(/page 1 of 1/i)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(15);
  });
});
