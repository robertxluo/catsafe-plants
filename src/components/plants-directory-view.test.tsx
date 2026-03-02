import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
    photo_urls: index % 2 === 0 ? ['/flower_placeholder.png'] : [],
    safety_status: index % 3 === 0 ? 'non_toxic' : index % 3 === 1 ? 'mildly_toxic' : 'highly_toxic',
    symptoms: null,
    toxic_parts: null,
    alternatives: [],
    citations: [
      {
        source_name: 'Test Source',
        source_url: 'https://example.com/source',
      },
    ],
  }));
}

function makeSearchParams({ page = null, q = null }: { page?: string | null; q?: string | null } = {}) {
  const params = new URLSearchParams();
  if (q) {
    params.set('q', q);
  }
  if (page) {
    params.set('page', page);
  }

  return {
    get: (key: string) => {
      if (key === 'page') return page;
      if (key === 'q') return q;
      return null;
    },
    toString: () => params.toString(),
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
      photo_urls: [],
      safety_status: 'non_toxic',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [
        {
          source_name: 'Test Source',
          source_url: 'https://example.com/source',
        },
      ],
    },
    {
      id: 'safe-blue',
      common_name: 'Safe Blue',
      scientific_name: 'Safeus blueii',
      aka_names: [],
      flower_colors: ['blue'],
      primary_image_url: null,
      photo_urls: [],
      safety_status: 'non_toxic',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [
        {
          source_name: 'Test Source',
          source_url: 'https://example.com/source',
        },
      ],
    },
    {
      id: 'toxic-yellow',
      common_name: 'Toxic Yellow',
      scientific_name: 'Toxicus yellowii',
      aka_names: [],
      flower_colors: ['yellow'],
      primary_image_url: null,
      photo_urls: [],
      safety_status: 'highly_toxic',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [
        {
          source_name: 'Test Source',
          source_url: 'https://example.com/source',
        },
      ],
    },
    {
      id: 'unknown-red',
      common_name: 'Unknown Red',
      scientific_name: 'Unknownus redii',
      aka_names: [],
      flower_colors: ['red'],
      primary_image_url: null,
      photo_urls: [],
      safety_status: 'unknown',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [],
    },
  ];
}

function makeSearchablePlants(): Plant[] {
  return [
    {
      id: 'hibiscus',
      common_name: 'Hibiscus',
      scientific_name: 'Hibiscus rosa-sinensis',
      aka_names: ['Rose Mallow'],
      flower_colors: ['pink'],
      primary_image_url: null,
      photo_urls: [],
      safety_status: 'non_toxic',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [
        {
          source_name: 'Test Source',
          source_url: 'https://example.com/source',
        },
      ],
    },
    {
      id: 'orchid',
      common_name: 'Phalaenopsis Orchid',
      scientific_name: 'Phalaenopsis amabilis',
      aka_names: ['Moth Orchid'],
      flower_colors: ['white'],
      primary_image_url: null,
      photo_urls: [],
      safety_status: 'non_toxic',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [
        {
          source_name: 'Test Source',
          source_url: 'https://example.com/source',
        },
      ],
    },
    {
      id: 'tulip',
      common_name: 'Tulip',
      scientific_name: 'Tulipa gesneriana',
      aka_names: ['Garden Tulip'],
      flower_colors: ['yellow'],
      primary_image_url: null,
      photo_urls: [],
      safety_status: 'highly_toxic',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [
        {
          source_name: 'Test Source',
          source_url: 'https://example.com/source',
        },
      ],
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
    mockUseSearchParams.mockReturnValue(makeSearchParams());
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
      expect(screen.getByRole('button', { name: /back/i })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('includes homepage nav pills and routes home from the Home pill', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(5));

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^home$/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /plant directory/i })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /^home$/i }));
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('marks the Plant Directory nav pill as the active page', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(5));

    render(<PlantsDirectoryView />);

    const plantDirectoryButton = await screen.findByRole('button', { name: /plant directory/i });
    expect(plantDirectoryButton.getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('button', { name: /^home$/i }).getAttribute('aria-current')).toBeNull();
  });

  it('opens plant details with a returnTo back-reference to the directory root by default', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(5));

    render(<PlantsDirectoryView />);

    fireEvent.click(await screen.findByRole('button', { name: /open details for plant 1/i }));

    expect(mockPush).toHaveBeenCalledWith('/plants/plant-1?returnTo=%2Fplants');
  });

  it('preserves active directory query state in the detail returnTo link', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(45));
    mockUseSearchParams.mockReturnValue(makeSearchParams({ page: '2', q: 'plant' }));

    render(<PlantsDirectoryView />);

    fireEvent.click(await screen.findByRole('button', { name: /open details for plant 21/i }));

    expect(mockPush).toHaveBeenCalledWith('/plants/plant-21?returnTo=%2Fplants%3Fq%3Dplant%26page%3D2');
  });

  it('renders 20 plants per page with pagination controls and page indicator', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(45));

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(20);
    });
    expect(screen.getAllByText(/page 1 of 3/i).length).toBeGreaterThan(0);

    const previousButtons = screen.getAllByRole('button', { name: /previous/i });
    const nextButtons = screen.getAllByRole('button', { name: /next/i });

    expect(previousButtons[0].hasAttribute('disabled')).toBe(true);
    expect(nextButtons[0].hasAttribute('disabled')).toBe(false);

    fireEvent.click(nextButtons[0]);
    expect(mockPush).toHaveBeenCalledWith('/plants?page=2');
  });

  it('supports boundary paging controls on middle and last pages', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(45));
    mockUseSearchParams.mockReturnValue(makeSearchParams({ page: '2' }));

    const { rerender } = render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getAllByText(/page 2 of 3/i).length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByRole('button', { name: /previous/i })[0]);
    expect(mockPush).toHaveBeenCalledWith('/plants');

    fireEvent.click(screen.getAllByRole('button', { name: /next/i })[0]);
    expect(mockPush).toHaveBeenCalledWith('/plants?page=3');

    mockUseSearchParams.mockReturnValue(makeSearchParams({ page: '3' }));
    rerender(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getAllByText(/page 3 of 3/i).length).toBeGreaterThan(0);
    });

    expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(5);
    expect(screen.getAllByRole('button', { name: /next/i })[0].hasAttribute('disabled')).toBe(true);
  });

  it('normalizes invalid page query values to page 1', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(45));
    mockUseSearchParams.mockReturnValue(makeSearchParams({ page: 'invalid' }));

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getAllByText(/page 1 of 3/i).length).toBeGreaterThan(0);
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
      expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(3);
    });

    expect(mockedLoadPlants).toHaveBeenCalledTimes(2);
  });

  it('filters results by safety status', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(9));

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(9);
    });

    fireEvent.click(screen.getByRole('button', { name: /^safe only$/i }));

    expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(3);
  });

  it('filters results by flower color', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(10));

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(10);
    });

    fireEvent.click(screen.getByRole('button', { name: /^yellow$/i }));

    expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(2);
  });

  it('applies safety and color filters with AND logic', async () => {
    mockedLoadPlants.mockResolvedValue(makeFilterPlants());

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(4);
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
      expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(4);
    });

    fireEvent.click(screen.getByRole('button', { name: /^toxic only$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^blue$/i }));

    expect(screen.getByText(/no plants match your current search and filter selections\./i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /reset filters/i }));

    expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(4);
  });

  it('keeps pagination accurate when filters reduce result count', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(45));
    mockUseSearchParams.mockReturnValue(makeSearchParams({ page: '3' }));

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getAllByText(/page 3 of 3/i).length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole('button', { name: /^safe only$/i }));

    expect(screen.queryByRole('navigation', { name: /pagination footer/i })).toBeNull();
    expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(15);
  });

  it('renders a desktop remainder card when the last xl row has leftover slots', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(20));

    render(<PlantsDirectoryView />);

    const remainderCard = await screen.findByTestId('directory-remainder-card');
    expect(remainderCard.textContent).toContain('Need a specific plant?');
    expect(remainderCard.textContent).toContain(
      'Search by common name, scientific name, or alias to jump straight to a match.'
    );
    expect(remainderCard.className).toContain('hidden xl:flex');
  });

  it('does not render a remainder card when the xl row is already complete', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(18));

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(18);
    });

    expect(screen.queryByTestId('directory-remainder-card')).toBeNull();
  });

  it('does not render a remainder card when too few plants are visible to reach a third row', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(5));

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(5);
    });

    expect(screen.queryByTestId('directory-remainder-card')).toBeNull();
  });

  it('shows the active-filter remainder variant with a clear-all action when refinements are active', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(20));

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(20);
    });

    fireEvent.click(screen.getByRole('button', { name: /^safe only$/i }));

    const remainderCard = await screen.findByTestId('directory-remainder-card');
    expect(remainderCard.textContent).toContain('Want broader results?');
    expect(remainderCard.textContent).toContain('Clear the current search or filters to reopen the full catalog.');

    fireEvent.click(within(remainderCard).getByRole('button', { name: /clear all/i }));

    await waitFor(() => {
      expect(screen.queryByText(/want broader results\?/i)).toBeNull();
    });
  });

  it('labels uncited plants as evidence incomplete and displays unknown safety', async () => {
    mockedLoadPlants.mockResolvedValue([
      {
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
      },
    ]);

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open details for uncited safe/i })).toBeTruthy();
    });

    expect(screen.getByText(/evidence incomplete/i)).toBeTruthy();
    expect(screen.getByText(/^unknown$/i)).toBeTruthy();
  });

  it('renders the search input above filters', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(5));

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getByRole('searchbox', { name: /search plant directory/i })).toBeTruthy();
    });
  });

  it('initializes search input and results from q in URL', async () => {
    mockedLoadPlants.mockResolvedValue(makeSearchablePlants());
    mockUseSearchParams.mockReturnValue(makeSearchParams({ q: 'hibiscus' }));

    render(<PlantsDirectoryView />);

    const input = await screen.findByRole('searchbox', { name: /search plant directory/i });
    expect((input as HTMLInputElement).value).toBe('hibiscus');
    expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(1);
    expect(screen.getByRole('button', { name: /open details for hibiscus/i })).toBeTruthy();
  });

  it('matches search case-insensitively across common, scientific, and alias names', async () => {
    mockedLoadPlants.mockResolvedValue(makeSearchablePlants());
    mockUseSearchParams.mockReturnValue(makeSearchParams({ q: 'mOtH' }));

    const { rerender } = render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(1);
    });
    expect(screen.getByRole('button', { name: /open details for phalaenopsis orchid/i })).toBeTruthy();

    mockUseSearchParams.mockReturnValue(makeSearchParams({ q: 'TULIPA' }));
    rerender(<PlantsDirectoryView />);
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(1);
    });
    expect(screen.getByRole('button', { name: /open details for tulip/i })).toBeTruthy();

    mockUseSearchParams.mockReturnValue(makeSearchParams({ q: 'hibiscus' }));
    rerender(<PlantsDirectoryView />);
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(1);
    });
    expect(screen.getByRole('button', { name: /open details for hibiscus/i })).toBeTruthy();
  });

  it('applies search with safety and color filters using AND logic', async () => {
    mockedLoadPlants.mockResolvedValue(makeSearchablePlants());
    mockUseSearchParams.mockReturnValue(makeSearchParams({ q: 'orchid' }));

    render(<PlantsDirectoryView />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /open details for/i })).toHaveLength(1);
    });

    fireEvent.click(screen.getByRole('button', { name: /^yellow$/i }));
    expect(screen.getByText(/no plants match your current search and filter selections\./i)).toBeTruthy();

    fireEvent.click(screen.getAllByRole('button', { name: /^all$/i })[1]);
    fireEvent.click(screen.getByRole('button', { name: /^safe only$/i }));
    expect(screen.getByRole('button', { name: /open details for phalaenopsis orchid/i })).toBeTruthy();
  });

  it('updates q in URL with debounce and removes page when search changes', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(45));
    mockUseSearchParams.mockReturnValue(makeSearchParams({ page: '2' }));

    render(<PlantsDirectoryView />);

    const input = await screen.findByRole('searchbox', { name: /search plant directory/i });
    fireEvent.change(input, { target: { value: 'hibiscus' } });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/plants?q=hibiscus');
    });
  });

  it('clears q from URL after debounce when search input is emptied', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(45));
    mockUseSearchParams.mockReturnValue(makeSearchParams({ q: 'hibiscus', page: '2' }));

    render(<PlantsDirectoryView />);

    const input = await screen.findByRole('searchbox', { name: /search plant directory/i });
    fireEvent.change(input, { target: { value: '' } });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/plants');
    });
  });

  it('syncs search input with browser navigation changes to q', async () => {
    mockedLoadPlants.mockResolvedValue(makePlants(20));
    mockUseSearchParams.mockReturnValue(makeSearchParams({ q: 'hibiscus' }));

    const { rerender } = render(<PlantsDirectoryView />);

    const input = await screen.findByRole('searchbox', { name: /search plant directory/i });
    expect((input as HTMLInputElement).value).toBe('hibiscus');

    mockUseSearchParams.mockReturnValue(makeSearchParams({ q: 'orchid' }));
    rerender(<PlantsDirectoryView />);

    await waitFor(() => {
      expect((screen.getByRole('searchbox', { name: /search plant directory/i }) as HTMLInputElement).value).toBe(
        'orchid'
      );
    });
  });
});
