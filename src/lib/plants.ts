export type SafetyStatus = 'non_toxic' | 'mildly_toxic' | 'highly_toxic' | 'unknown';
export type FlowerColor = 'white' | 'yellow' | 'orange' | 'red' | 'pink' | 'purple' | 'blue' | 'green';

export interface Plant {
  id: string;
  common_name: string;
  scientific_name: string;
  aka_names: string[];
  flower_colors: FlowerColor[];
  primary_image_url: string | null;
  photo_urls: string[];
  safety_status: SafetyStatus;
  symptoms: string | null;
  toxic_parts: string | null;
  alternatives: string[];
  citations: {
    source_name: string;
    source_url: string;
  }[];
}

export const plants: Plant[] = [
  {
    id: 'lilium',
    common_name: 'Lily',
    scientific_name: 'Lilium spp.',
    aka_names: ['Easter Lily', 'Tiger Lily', 'Asiatic Lily'],
    flower_colors: ['white', 'orange', 'pink', 'red'],
    primary_image_url: '/flower_placeholder.png',
    photo_urls: ['/flower_placeholder.png', '/flower_placeholder.png', '/flower_placeholder.png'],
    safety_status: 'highly_toxic',
    symptoms:
      'Vomiting, loss of appetite, lethargy, kidney failure. Even small ingestions (pollen, water from vase) can be fatal to cats.',
    toxic_parts: 'All parts — petals, leaves, pollen, stems, and water in the vase.',
    alternatives: ['spider-plant', 'boston-fern', 'areca-palm'],
    citations: [
      {
        source_name: 'ASPCA Animal Poison Control - Lily',
        source_url: 'https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants/lily',
      },
      {
        source_name: 'FDA - Lovely Lilies and Curious Cats: A Dangerous Combination',
        source_url:
          'https://www.fda.gov/animal-veterinary/animal-health-literacy/lovely-lilies-and-curious-cats-dangerous-combination',
      },
    ],
  },
  {
    id: 'spider-plant',
    common_name: 'Spider Plant',
    scientific_name: 'Chlorophytum comosum',
    aka_names: ['Airplane Plant', 'Ribbon Plant', 'Spider Ivy'],
    flower_colors: ['white'],
    primary_image_url: '/flower_placeholder.png',
    photo_urls: ['/flower_placeholder.png'],
    safety_status: 'non_toxic',
    symptoms: null,
    toxic_parts: null,
    alternatives: [],
    citations: [],
  },
  {
    id: 'monstera',
    common_name: 'Monstera',
    scientific_name: 'Monstera deliciosa',
    aka_names: ['Swiss Cheese Plant', 'Split-Leaf Philodendron'],
    flower_colors: ['white'],
    primary_image_url: null,
    photo_urls: [],
    safety_status: 'mildly_toxic',
    symptoms: 'Oral irritation, excessive drooling, vomiting, difficulty swallowing due to calcium oxalate crystals.',
    toxic_parts: 'Leaves and stems contain insoluble calcium oxalate crystals.',
    alternatives: ['spider-plant', 'boston-fern', 'calathea'],
    citations: [],
  },
  {
    id: 'unknown-plant',
    common_name: 'Unknown Plant',
    scientific_name: 'Species unidentified',
    aka_names: ['Mystery Plant'],
    flower_colors: ['green'],
    primary_image_url: null,
    photo_urls: [],
    safety_status: 'unknown',
    symptoms: null,
    toxic_parts: null,
    alternatives: [],
    citations: [],
  },
  {
    id: 'boston-fern',
    common_name: 'Boston Fern',
    scientific_name: 'Nephrolepis exaltata',
    aka_names: ['Sword Fern', 'Ladder Fern'],
    flower_colors: ['green'],
    primary_image_url: null,
    photo_urls: [],
    safety_status: 'non_toxic',
    symptoms: null,
    toxic_parts: null,
    alternatives: [],
    citations: [],
  },
  {
    id: 'areca-palm',
    common_name: 'Areca Palm',
    scientific_name: 'Dypsis lutescens',
    aka_names: ['Butterfly Palm', 'Golden Cane Palm'],
    flower_colors: ['yellow'],
    primary_image_url: null,
    photo_urls: [],
    safety_status: 'non_toxic',
    symptoms: null,
    toxic_parts: null,
    alternatives: [],
    citations: [],
  },
  {
    id: 'calathea',
    common_name: 'Calathea',
    scientific_name: 'Calathea spp.',
    aka_names: ['Prayer Plant', 'Zebra Plant'],
    flower_colors: ['purple', 'pink'],
    primary_image_url: null,
    photo_urls: [],
    safety_status: 'non_toxic',
    symptoms: null,
    toxic_parts: null,
    alternatives: [],
    citations: [],
  },
  {
    id: 'pothos',
    common_name: 'Pothos',
    scientific_name: 'Epipremnum aureum',
    aka_names: ["Devil's Ivy", 'Golden Pothos', 'Taro Vine'],
    flower_colors: ['green', 'white'],
    primary_image_url: null,
    photo_urls: [],
    safety_status: 'mildly_toxic',
    symptoms: 'Oral irritation, drooling, vomiting, difficulty swallowing.',
    toxic_parts: 'Leaves and stems.',
    alternatives: ['spider-plant', 'boston-fern', 'calathea'],
    citations: [],
  },
];

export function getPlantById(id: string): Plant | undefined {
  return plants.find((p) => p.id === id);
}

export function hasCitationEvidence(plant: Pick<Plant, 'citations'>): boolean {
  return plant.citations.length > 0;
}

export function hasIncompleteEvidence(plant: Pick<Plant, 'citations'>): boolean {
  return !hasCitationEvidence(plant);
}

export function getDisplaySafetyStatus(plant: Pick<Plant, 'safety_status' | 'citations'>): SafetyStatus {
  return hasCitationEvidence(plant) ? plant.safety_status : 'unknown';
}

export function getStatusLabel(status: SafetyStatus): string {
  switch (status) {
    case 'non_toxic':
      return 'Safe for Cats';
    case 'mildly_toxic':
      return 'Mildly Toxic';
    case 'highly_toxic':
      return 'Highly Toxic';
    case 'unknown':
      return 'Unknown';
  }
}

export function getStatusColor(status: SafetyStatus) {
  switch (status) {
    case 'non_toxic':
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'mildly_toxic':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'highly_toxic':
      return {
        bg: 'bg-rose-100',
        text: 'text-rose-800',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'unknown':
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
        dot: 'bg-gray-500',
      };
  }
}
