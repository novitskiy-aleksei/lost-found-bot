import { catchError, map } from 'rxjs/operators';
import { HttpService, Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import * as querystring from 'querystring';
import { Pet } from '../models/pet';

@Injectable()
export class MyPetsService {
  private apiKey: string;

  constructor(private http: HttpService) {
  }

  getMyPets(): Pet[] {
    return [
      {title: 'Polkan', description: 'My favourite doggy', image: 'https://www.ccreadingfarm.com/wp-content/uploads/doggy-day.jpg'},
      {title: 'Jackie', description: 'Just little kitty', image: 'http://wfiles.brothersoft.com/l/l_s/little-cat_185199-480x360.jpg'},
      {title: 'Bobby', description: 'Who is a good boi?',
        image: 'http://www.doggydaycarecornwall.co.uk/wp-content/uploads/2016/09/Doggy-Day-Care-Cornwall-2.jpg'},
    ].map(p => new Pet(p));
  }

  // private call(method, params): Observable<Pet | null> {
  //   return this.http
  //     .get(`${this.url}/${method}?appid=${this.apiKey}&` + querystring.stringify(params))
  //     .pipe(
  //       map((response: any) => new Pet(response.data)),
  //       catchError((err, caught) => of(null)),
  //     );
  // }
}
