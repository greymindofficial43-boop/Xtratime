import { PartialType } from '@nestjs/mapped-types';
import { CreatePopupAdDto } from './create-popup-ad.dto';

export class UpdatePopupAdDto extends PartialType(CreatePopupAdDto) {}
