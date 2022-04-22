import { FormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Component } from '@angular/core';
import { Apollo, gql } from 'apollo-angular'

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss']
})
export class RestaurantComponent {
  restaurants$ = new BehaviorSubject<any[]>([]);
  queryChoice?: string;

  restaurantNameForm = this.formBuilder.group({
    restaurantName: ''
  })
  restaurantNameResult$ = new BehaviorSubject<string>('');

  createRestaurantForm = this.formBuilder.group({
    name: '',
    street_address: '',
    city: '',
    state: ''
  })
  createRestaurantResult$ = new BehaviorSubject<string>('');

  constructor(private apollo: Apollo, private formBuilder: FormBuilder) {}

  getRestaurants() {
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

  getRestaurantByName() {
    this.apollo.query({
      query: gql`
        query getRestaurantByName($name: String!) {
          restaurantByName(name: $name) {
            name
            address {
              street
              city
              state
            }
          }
        }
      `,
      variables: {
        name: this.restaurantNameForm.value.restaurantName
      }
    }).subscribe((data: any) => {
      const _restaurant = data.data.restaurantByName;
      if (!_restaurant) {
        if (this.restaurantNameForm.value.restaurantName !== '') {
          this.restaurantNameResult$.next(`No restaurants with name ${this.restaurantNameForm.value.restaurantName} were found.`)
        } else {
          this.restaurantNameResult$.next(`Please type something in the restaurant name field.`)
        }
      } else {
        this.restaurantNameResult$.next(`${_restaurant.name} is located at ${_restaurant.address.street}, ${_restaurant.address.city}, ${_restaurant.address.state}`)
      }
    })
  }

  createRestaurant() {
    this.createRestaurantResult$.next('')
    const userInput = this.createRestaurantForm.value;
    // validation. If any inputs are missing, exit early
    for(let key of Object.keys(userInput)) {
      if(userInput[key] === '') {
        this.createRestaurantResult$.next('All fields are required. Please supply a name, address, city and state.')
        return;
      }
    }

    this.createRestaurantResult$.next('')
    this.apollo.mutate({
      mutation: gql`
        mutation createRestaurant($input: CreateRestaurantInput!) {
          createRestaurant(input: $input) {
            ... on CreateRestaurantSuccess {
              restaurant {
                name
                slug
              }
            }
          }
        }
      `,
      variables: {
        input: {
          name: userInput.name,
          slug: this.convertToSlug(userInput.name),
          address: {
            street: userInput.street,
            city: userInput.city,
            state: userInput.state
          }
        }
      }
    }).subscribe((data: any) => {
      this.createRestaurantResult$.next(`${data.data.createRestaurant.__typename}`)
    }, (error) => {
      console.error(error)
    })
  }

  convertToSlug(text: string) {
    return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  }
}
