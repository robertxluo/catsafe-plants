import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DetailView } from '@/src/components/detail-view';
import { loadPlants } from '@/src/lib/load-plants';
import { plants as mockPlants, type Plant } from '@/src/lib/plants';

vi.mock('@/src/lib/load-plants', () => ({
  loadPlants: vi.fn(),
}));

const mockedLoadPlants = vi.mocked(loadPlants);

function makeGalleryPlant(photoUrls: string[]): Plant {
  return {
    id: 'gallery-plant',
    common_name: 'Gallery Plant',
    scientific_name: 'Galleryus plantii',
    aka_names: [],
    flower_colors: ['green'],
    primary_image_url: photoUrls[0] ?? null,
    photo_urls: photoUrls,
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
  };
}

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
    expect(screen.getAllByText(/^unknown$/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole('heading', { name: /symptoms/i })).toBeNull();
    expect(screen.queryByRole('heading', { name: /toxic parts/i })).toBeNull();

    const evidenceHeading = screen.getByRole('heading', { name: /evidence/i });
    const evidenceSection = evidenceHeading.closest('section');
    expect(evidenceSection).not.toBeNull();
    expect(within(evidenceSection as HTMLElement).getByText(/required source citation/i)).toBeTruthy();
    expect(screen.queryByRole('link', { name: /open source/i })).toBeNull();
    expect(screen.queryByRole('heading', { name: /safe alternatives/i })).toBeNull();
    expect(screen.getByText(/not a substitute for professional veterinary care/i)).toBeTruthy();
  });

  it('uses cautious non-toxic wording instead of absolute safety language', async () => {
    const citedSafePlant: Plant = {
      id: 'safe-with-evidence',
      common_name: 'Safe With Evidence',
      scientific_name: 'Safeus evidenceii',
      aka_names: [],
      flower_colors: ['green'],
      primary_image_url: null,
      photo_urls: [],
      safety_status: 'non_toxic',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [
        {
          source_name: 'ASPCA',
          source_url: 'https://www.aspca.org/example',
        },
      ],
    };

    mockedLoadPlants.mockResolvedValueOnce([...mockPlants, citedSafePlant]);

    render(<DetailView plantId="safe-with-evidence" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(await screen.findByText(/currently regarded as non-toxic/i)).toBeTruthy();
    expect(screen.getByText(/individual reactions can vary/i)).toBeTruthy();
    expect(screen.queryByRole('heading', { name: /safe alternatives/i })).toBeNull();
  });

  it('treats missing evidence as unknown and labels the record incomplete', async () => {
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

    mockedLoadPlants.mockResolvedValueOnce([...mockPlants, uncitedPlant]);

    render(<DetailView plantId="uncited-safe" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /uncited safe/i })).toBeTruthy();
    expect(screen.getAllByText(/^unknown$/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/evidence incomplete/i)).toBeTruthy();
    expect(screen.getByText(/treat safety as unknown and use caution/i)).toBeTruthy();
  });

  it('gracefully hides empty toxic details when toxic fields are missing', async () => {
    const toxicMissingFieldsPlant: Plant = {
      id: 'toxic-missing-fields',
      common_name: 'Toxic Test Plant',
      scientific_name: 'Testus toxicus',
      aka_names: [],
      flower_colors: ['red'],
      primary_image_url: null,
      photo_urls: [],
      safety_status: 'highly_toxic',
      symptoms: null,
      toxic_parts: null,
      alternatives: [],
      citations: [
        {
          source_name: 'ASPCA',
          source_url: 'https://www.aspca.org/example',
        },
      ],
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

  it('renders carousel with first image active and dots', async () => {
    const galleryPlant = makeGalleryPlant([
      'https://example.com/primary.jpg',
      'https://example.com/secondary.jpg',
      'https://example.com/third.jpg',
    ]);

    mockedLoadPlants.mockResolvedValueOnce([...mockPlants, galleryPlant]);

    render(<DetailView plantId="gallery-plant" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(await screen.findByRole('img', { name: /gallery plant photo 1 of 3/i })).toBeTruthy();
    expect(screen.queryByRole('img', { name: /gallery plant photo 2 of 3/i })).toBeNull();
    expect(screen.getAllByRole('button', { name: /go to image/i })).toHaveLength(3);
  });

  it('navigates to next and previous image via edge arrows', async () => {
    const galleryPlant = makeGalleryPlant([
      'https://example.com/primary.jpg',
      'https://example.com/secondary.jpg',
      'https://example.com/third.jpg',
    ]);

    mockedLoadPlants.mockResolvedValueOnce([...mockPlants, galleryPlant]);

    render(<DetailView plantId="gallery-plant" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(await screen.findByRole('img', { name: /gallery plant photo 1 of 3/i })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /next image/i }));
    expect(screen.getByRole('img', { name: /gallery plant photo 2 of 3/i })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /previous image/i }));
    expect(screen.getByRole('img', { name: /gallery plant photo 1 of 3/i })).toBeTruthy();
  });

  it('hides boundary arrows at first and last image', async () => {
    const galleryPlant = makeGalleryPlant([
      'https://example.com/primary.jpg',
      'https://example.com/secondary.jpg',
    ]);

    mockedLoadPlants.mockResolvedValueOnce([...mockPlants, galleryPlant]);

    render(<DetailView plantId="gallery-plant" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(await screen.findByRole('img', { name: /gallery plant photo 1 of 2/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /previous image/i })).toBeNull();
    expect(screen.getByRole('button', { name: /next image/i })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /next image/i }));
    expect(screen.getByRole('img', { name: /gallery plant photo 2 of 2/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /next image/i })).toBeNull();
    expect(screen.getByRole('button', { name: /previous image/i })).toBeTruthy();
  });

  it('jumps to selected image when dot is clicked', async () => {
    const galleryPlant = makeGalleryPlant([
      'https://example.com/primary.jpg',
      'https://example.com/secondary.jpg',
      'https://example.com/third.jpg',
    ]);

    mockedLoadPlants.mockResolvedValueOnce([...mockPlants, galleryPlant]);

    render(<DetailView plantId="gallery-plant" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(await screen.findByRole('img', { name: /gallery plant photo 1 of 3/i })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /go to image 3/i }));
    expect(screen.getByRole('img', { name: /gallery plant photo 3 of 3/i })).toBeTruthy();
  });

  it('supports keyboard arrow navigation on focused carousel', async () => {
    const galleryPlant = makeGalleryPlant([
      'https://example.com/primary.jpg',
      'https://example.com/secondary.jpg',
      'https://example.com/third.jpg',
    ]);

    mockedLoadPlants.mockResolvedValueOnce([...mockPlants, galleryPlant]);

    render(<DetailView plantId="gallery-plant" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(await screen.findByRole('img', { name: /gallery plant photo 1 of 3/i })).toBeTruthy();
    const carousel = screen.getByLabelText(/gallery plant image carousel/i);

    carousel.focus();
    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    expect(screen.getByRole('img', { name: /gallery plant photo 2 of 3/i })).toBeTruthy();

    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    expect(screen.getByRole('img', { name: /gallery plant photo 3 of 3/i })).toBeTruthy();

    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    expect(screen.getByRole('img', { name: /gallery plant photo 3 of 3/i })).toBeTruthy();

    fireEvent.keyDown(carousel, { key: 'ArrowLeft' });
    expect(screen.getByRole('img', { name: /gallery plant photo 2 of 3/i })).toBeTruthy();
  });

  it('single-image gallery hides navigation controls and dots', async () => {
    const galleryPlant = makeGalleryPlant(['https://example.com/primary.jpg']);

    mockedLoadPlants.mockResolvedValueOnce([...mockPlants, galleryPlant]);

    render(<DetailView plantId="gallery-plant" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(await screen.findByRole('img', { name: /gallery plant photo 1 of 1/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /next image/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /previous image/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /go to image/i })).toBeNull();
  });

  it('uses placeholder card when no gallery photos exist', async () => {
    const noImagePlant = makeGalleryPlant([]);
    noImagePlant.id = 'no-image-plant';
    noImagePlant.common_name = 'No Image Plant';
    noImagePlant.primary_image_url = null;
    noImagePlant.photo_urls = [];

    mockedLoadPlants.mockResolvedValueOnce([...mockPlants, noImagePlant]);

    render(<DetailView plantId="no-image-plant" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /no image plant/i })).toBeTruthy();
    expect(screen.queryByRole('img', { name: /no image plant photo/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /next image/i })).toBeNull();
  });

  it('uses onGoHome for the Home nav instead of onBack', async () => {
    const onBack = vi.fn();
    const onGoHome = vi.fn();

    render(<DetailView plantId="lilium" onBack={onBack} onGoHome={onGoHome} onSelectPlant={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /lily/i })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /^home$/i }));
    expect(onGoHome).toHaveBeenCalledTimes(1);
    expect(onBack).not.toHaveBeenCalled();
  });

  it('renders the provided back label in the loading state', () => {
    let resolvePlants!: (value: Plant[]) => void;
    mockedLoadPlants.mockReturnValueOnce(
      new Promise<Plant[]>((resolve) => {
        resolvePlants = resolve;
      })
    );

    render(
      <DetailView plantId="lilium" onBack={vi.fn()} onSelectPlant={vi.fn()} backLabel="Back to Directory" />
    );

    expect(screen.getByRole('button', { name: /back to directory/i })).toBeTruthy();
    resolvePlants(mockPlants);
  });

  it('renders the provided back label in the error state', async () => {
    mockedLoadPlants.mockRejectedValueOnce(new Error('Unable to load plant data. Please try again.'));

    render(<DetailView plantId="lilium" onBack={vi.fn()} onSelectPlant={vi.fn()} backLabel="Back to Directory" />);

    expect(await screen.findByText(/unable to load plant data\. please try again\./i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /back to directory/i })).toBeTruthy();
  });

  it('renders the provided back label in the not-found state', async () => {
    render(<DetailView plantId="not-real" onBack={vi.fn()} onSelectPlant={vi.fn()} backLabel="Back to Directory" />);

    expect(await screen.findByText(/plant not found\./i)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /back to directory/i }).length).toBeGreaterThan(0);
  });

  it('renders the provided back label in the success state', async () => {
    render(<DetailView plantId="lilium" onBack={vi.fn()} onSelectPlant={vi.fn()} backLabel="Back to Directory" />);

    expect(await screen.findByRole('heading', { name: /lily/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /back to directory/i })).toBeTruthy();
  });

  it('keeps both top-level nav pills inactive on detail pages', async () => {
    render(<DetailView plantId="lilium" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /lily/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^home$/i }).getAttribute('aria-current')).toBeNull();
    expect(screen.getByRole('button', { name: /plant directory/i }).getAttribute('aria-current')).toBeNull();
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
