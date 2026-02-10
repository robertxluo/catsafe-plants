import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DetailView } from '@/src/components/detail-view';
import * as plantsModule from '@/src/lib/plants';

describe('DetailView', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('renders toxic symptoms and toxic parts when present', () => {
    render(<DetailView plantId="lilium" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /lily/i })).toBeTruthy();
    expect(screen.getByText(/highly toxic/i)).toBeTruthy();
    expect(screen.getByRole('heading', { name: /symptoms/i })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /toxic parts/i })).toBeTruthy();
    expect(screen.getByText(/not a substitute for professional veterinary care/i)).toBeTruthy();
  });

  it('renders disclaimer and hides toxic detail sections for unknown plants', () => {
    render(<DetailView plantId="unknown-plant" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /unknown plant/i })).toBeTruthy();
    expect(screen.getByText(/unknown safety/i)).toBeTruthy();
    expect(screen.queryByRole('heading', { name: /symptoms/i })).toBeNull();
    expect(screen.queryByRole('heading', { name: /toxic parts/i })).toBeNull();
    expect(screen.getByText(/not a substitute for professional veterinary care/i)).toBeTruthy();
  });

  it('gracefully hides empty toxic details when toxic fields are missing', () => {
    vi.spyOn(plantsModule, 'getPlantById').mockImplementation((id: string) => {
      if (id === 'toxic-missing-fields') {
        return {
          id: 'toxic-missing-fields',
          common_name: 'Toxic Test Plant',
          scientific_name: 'Testus toxicus',
          aka_names: [],
          primary_image_url: null,
          safety_status: 'highly_toxic',
          symptoms: null,
          toxic_parts: null,
          alternatives: [],
        };
      }
      return undefined;
    });

    render(<DetailView plantId="toxic-missing-fields" onBack={vi.fn()} onSelectPlant={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /toxic test plant/i })).toBeTruthy();
    expect(screen.getByText(/highly toxic/i)).toBeTruthy();
    expect(screen.queryByRole('heading', { name: /symptoms/i })).toBeNull();
    expect(screen.queryByRole('heading', { name: /toxic parts/i })).toBeNull();
    expect(screen.getByText(/not a substitute for professional veterinary care/i)).toBeTruthy();
  });
});
