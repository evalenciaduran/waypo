import { TourismPoi } from '@tourism/domain';
import { TourismPoiDto } from './tourism-poi.dto';

export function mapTourismPoiDto(dto: TourismPoiDto): TourismPoi {
  return {
    id: String(dto.id),
    name: String(dto.name ?? ''),
    city: String(dto.city ?? ''),
    category: String(dto.category ?? 'general'),
    location: {
      lat: Number(dto.lat),
      lng: Number(dto.lng),
    },
    shortDescription: String(dto.shortDescription ?? ''),
    imageUrl: dto.imageUrl ?? undefined,
    source: dto.source ?? 'internal',
    updatedAt: dto.updatedAt ?? new Date().toISOString(),
  };
}
