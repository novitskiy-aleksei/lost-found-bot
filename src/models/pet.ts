import { Populated } from '../framework/models/populated.abstract';

export class Pet extends Populated {
  name: string;
  image: string;
  description: string;
}
