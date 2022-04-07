import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular'

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss']
})
export class RestaurantComponent {
  restaurants$ = new BehaviorSubject<any[]>([]);
  queryChoice?: string;

  constructor(private apollo: Apollo) {}

  getRestaurants() {
    console.log('here')
    this.apollo.query({
      query: gql`
        query restaurants {
          restaurants {
            name
            address {
              street
              city
              state
              zip
            }
          }
        }
      `
    }).subscribe((data: any) => {
      this.restaurants$.next(Object.assign([], data.data.restaurants))
    })
  }
}
