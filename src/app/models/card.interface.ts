export interface CardItem {
  image: string;
  title: string;
  desc: string;
  link: string;
}

export interface CardData {
  title: string;
  description: string;
  length: number;
  items: CardItem[];
}

export const DEFAULT_CARD_DATA: CardData = {
  title: 'Recommended just for you!',
  description: '',
  length: 100,
  items: [
    {
      image: 'img/logo.png',
      title: 'Coaching & Quizzes',
      desc: 'Looking for coaching or Quizzes, we have a teacher near you & the best prepared Quizzes',
      link: '/register'
    },
    {
      image: 'img/logo.png',
      title: 'Online Admissions',
      desc: 'Applying into any school has never been easier & you even get to track progress till admission',
      link: '/login'
    },
    {
      image: 'img/logo.png',
      title: 'Learning Materials',
      desc: 'Explore thousands of written and video materials from the best schools and teachers',
      link: '#'
    },
    {
      image: 'img/logo.png',
      title: 'Learning Materials',
      desc: 'Explore thousands of written and video materials from the best schools and teachers',
      link: '/'
    }
  ]
};
