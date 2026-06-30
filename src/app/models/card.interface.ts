export interface searchExtras {
  key: string;
  value: any;
}

export interface CardItem {
  guid?: string;
  image?: string;
  title: string;
  desc: string;
  link?: string;
  search?: searchExtras[];
  raw?: any;
}

export interface CardData {
  title: string;
  description: string;
  length?: number;
  search?: boolean;
  items: CardItem[];
}

export const HOME_CARD_DATA: CardData = {
    title: 'Apply. Learn. Teach. Rise Beyond!',
    description: 'Recommended just for you, click now to find out more',
    items: [
      {
        image: 'img/logo.png',
        title: 'Coaching & Quizzes',
        desc: 'Looking for coaching or Quizzes, we have a teacher near you & the best prepared Quizzes',
        link: '/learning/quiz'
      },
      {
        image: 'img/girl_pointing.png',
        title: 'Online Admissions',
        desc: 'Applying into any school has never been easier & you even get to track progress till admission',
        link: '/login'
      },
      {
        image: 'img/mtn_app_challenge.jpg',
        title: 'Learning Materials',
        desc: 'Explore thousands of written and video materials from the best schools and teachers',
        link: '/learning'
      },
      {
        image: 'img/boy_with_book.jpg',
        title: 'Auto grading & Reports',
        desc: "Let the system auto grade, generate reports and send them to the parents",
        link: '/'
      }
    ]
  };
