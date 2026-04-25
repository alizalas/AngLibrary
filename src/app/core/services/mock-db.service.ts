import { Injectable } from '@angular/core';
import {
  Book,
  Genre,
  ImportRecord,
  RecommendationList,
  User
} from '../models/domain.models';
import {
  MOCK_BOOKS,
  MOCK_GENRES,
  MOCK_IMPORTS,
  MOCK_RECOMMENDATIONS,
  MOCK_USERS
} from '../constants/mock-data';

interface MockState {
  users: User[];
  genres: Genre[];
  books: Book[];
  recommendations: RecommendationList[];
  imports: ImportRecord[];
}

@Injectable({
  providedIn: 'root'
})
export class MockDbService {
  private readonly state: MockState = {
    users: structuredClone(MOCK_USERS),
    genres: structuredClone(MOCK_GENRES),
    books: structuredClone(MOCK_BOOKS),
    recommendations: structuredClone(MOCK_RECOMMENDATIONS),
    imports: structuredClone(MOCK_IMPORTS)
  };

  users(): User[] {
    return this.state.users;
  }

  genres(): Genre[] {
    return this.state.genres;
  }

  books(): Book[] {
    return this.state.books;
  }

  recommendations(): RecommendationList[] {
    return this.state.recommendations;
  }

  imports(): ImportRecord[] {
    return this.state.imports;
  }
}
