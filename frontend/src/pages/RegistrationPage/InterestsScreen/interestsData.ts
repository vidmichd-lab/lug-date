/**
 * Interests data with icons and colors
 * All 33 interests with their corresponding icon components from design-system
 */

import { Whatcinema } from '../../../design-system/components/whatcinema';
import { Whatliterature } from '../../../design-system/components/whatliterature';
import { Whatart } from '../../../design-system/components/whatart';
import { Whattheatre } from '../../../design-system/components/whattheatre';
import { Whatarchitecture } from '../../../design-system/components/whatarchitecture';
import { Whatdesign } from '../../../design-system/components/whatdesign';
import { Whatcook } from '../../../design-system/components/whatcook';
import { Whatphoto } from '../../../design-system/components/whatphoto';
import { Whatfashion } from '../../../design-system/components/whatfashion';
import { Whatdance } from '../../../design-system/components/whatdance';
import { Whatmusic } from '../../../design-system/components/whatmusic';
import { Whattravel } from '../../../design-system/components/whattravel';
import { Whatsport } from '../../../design-system/components/whatsport';
import { Whatlang } from '../../../design-system/components/whatlang';
import { Whatcamp } from '../../../design-system/components/whatcamp';
import { Whatserial } from '../../../design-system/components/whatserial';
import { Whathistory } from '../../../design-system/components/whathistory';
import { Whatpolitic } from '../../../design-system/components/whatpolitic';
import { Whatit } from '../../../design-system/components/whatit';
import { Whatweb3 } from '../../../design-system/components/whatweb3';
import { Whatanimals } from '../../../design-system/components/whatanimals';
import { Whatecology } from '../../../design-system/components/whatecology';
import { Whatrun } from '../../../design-system/components/whatrun';
import { Whatbike } from '../../../design-system/components/whatbike';
import { Whatpoetry } from '../../../design-system/components/whatpoetry';
import { Whatstandup } from '../../../design-system/components/whatstandup';
import { Whatgames } from '../../../design-system/components/whatgames';
import { Whatspace } from '../../../design-system/components/whatspace';
import { Whatanalys } from '../../../design-system/components/whatanalys';
import { Whatcode } from '../../../design-system/components/whatcode';
import { Whatmanager } from '../../../design-system/components/whatmanager';
import { Whatmarketing } from '../../../design-system/components/whatmarketing';
import { Whatplants } from '../../../design-system/components/whatplants';
import { Whatcharity } from '../../../design-system/components/whatcharity';
import { Whateconomic } from '../../../design-system/components/whateconomic';
import { Whatai } from '../../../design-system/components/whatai';
import { Whatmed } from '../../../design-system/components/whatmed';
import { Whatyoga } from '../../../design-system/components/whatyoga';
import { Whatteach } from '../../../design-system/components/whatteach';
import type { Interest } from '../../../components/InterestTag';

export const INTERESTS_DATA: Interest[] = [
  { id: 'cinema', label: 'Кино', iconComponent: Whatcinema, color: '#00C853' },
  { id: 'literature', label: 'Литература', iconComponent: Whatliterature, color: '#2196F3' },
  { id: 'art', label: 'Искусство', iconComponent: Whatart, color: '#F44336' },
  { id: 'theater', label: 'Театр', iconComponent: Whattheatre, color: '#E91E63' },
  { id: 'architecture', label: 'Архитектура', iconComponent: Whatarchitecture, color: '#F44336' },
  { id: 'design', label: 'Дизайн', iconComponent: Whatdesign, color: '#9C27B0' },
  { id: 'cooking', label: 'Кулинария', iconComponent: Whatcook, color: '#4CAF50' },
  { id: 'photography', label: 'Фотография', iconComponent: Whatphoto, color: '#2196F3' },
  { id: 'fashion', label: 'Мода', iconComponent: Whatfashion, color: '#E91E63' },
  { id: 'dance', label: 'Танец', iconComponent: Whatdance, color: '#2196F3' },
  { id: 'music', label: 'Музыка', iconComponent: Whatmusic, color: '#FF9800' },
  { id: 'travel', label: 'Путешествия', iconComponent: Whattravel, color: '#2196F3' },
  { id: 'sport', label: 'Спорт', iconComponent: Whatsport, color: '#4CAF50' },
  { id: 'languages', label: 'Языки', iconComponent: Whatlang, color: '#2196F3' },
  { id: 'hiking', label: 'Походы', iconComponent: Whatcamp, color: '#E91E63' },
  { id: 'series', label: 'Сериалы', iconComponent: Whatserial, color: '#F44336' },
  { id: 'history', label: 'История', iconComponent: Whathistory, color: '#E91E63' },
  { id: 'politics', label: 'Политика', iconComponent: Whatpolitic, color: '#2196F3' },
  { id: 'it', label: 'IT', iconComponent: Whatit, color: '#4CAF50' },
  { id: 'web3', label: 'WEB3', iconComponent: Whatweb3, color: '#FF9800' },
  { id: 'animals', label: 'Животные', iconComponent: Whatanimals, color: '#2196F3' },
  { id: 'ecology', label: 'Экология', iconComponent: Whatecology, color: '#F44336' },
  { id: 'running', label: 'Бег', iconComponent: Whatrun, color: '#2196F3' },
  { id: 'cycling', label: 'Велосипед', iconComponent: Whatbike, color: '#2196F3' },
  { id: 'poetry', label: 'Поэзия', iconComponent: Whatpoetry, color: '#4CAF50' },
  { id: 'standup', label: 'Стендап', iconComponent: Whatstandup, color: '#4CAF50' },
  { id: 'games', label: 'Игры', iconComponent: Whatgames, color: '#F44336' },
  { id: 'space', label: 'Космос', iconComponent: Whatspace, color: '#9E9E9E' },
  { id: 'analytics', label: 'Аналитика', iconComponent: Whatanalys, color: '#9C27B0' },
  { id: 'programming', label: 'Программирование', iconComponent: Whatcode, color: '#9C27B0' },
  { id: 'management', label: 'Менеджмент', iconComponent: Whatmanager, color: '#FFC107' },
  { id: 'marketing', label: 'Маркетинг', iconComponent: Whatmarketing, color: '#4CAF50' },
  { id: 'plants', label: 'Растения', iconComponent: Whatplants, color: '#8D6E63' },
  { id: 'charity', label: 'Благотворительность и НКО', iconComponent: Whatcharity, color: '#2196F3' },
  { id: 'business', label: 'Бизнес', iconComponent: Whateconomic, color: '#9C27B0' },
  { id: 'economics', label: 'Экономика', iconComponent: Whateconomic, color: '#E91E63' },
  { id: 'ai', label: 'AI', iconComponent: Whatai, color: '#9E9E9E' },
  { id: 'medicine', label: 'Медицина', iconComponent: Whatmed, color: '#FFC107' },
  { id: 'yoga', label: 'Йога', iconComponent: Whatyoga, color: '#9E9E9E' },
  { id: 'education', label: 'Преподавание и образование', iconComponent: Whatteach, color: '#9C27B0' },
];

