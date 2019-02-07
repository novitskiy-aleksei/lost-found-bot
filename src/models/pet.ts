import { Populated } from '../framework/models/populated.abstract';

export class Pet extends Populated {
  id: string;
  name: string;
  image: string;
  description: string;
}
