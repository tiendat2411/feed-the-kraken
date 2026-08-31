import jackSparrow from '../assets/ui/avatars/jack_sparrow.png';
import barbossa from '../assets/ui/avatars/barbossa.png';
import davyJones from '../assets/ui/avatars/davy_jones.png';
import willTurner from '../assets/ui/avatars/will_turner.png';
import elizabethSwann from '../assets/ui/avatars/elizabeth_swann.png';
import tiaDalma from '../assets/ui/avatars/tia_dalma.png';
import gibbs from '../assets/ui/avatars/gibbs.png';
import angelica from '../assets/ui/avatars/angelica.png';
import pintel from '../assets/ui/avatars/pintel.png';
import ragetti from '../assets/ui/avatars/ragetti.png';
import jackMonkey from '../assets/ui/avatars/jack_monkey.png';

export const PIRATE_AVATARS = [
  { id: 'jack_sparrow', name: 'Jack Sparrow', src: jackSparrow },
  { id: 'barbossa', name: 'Hector Barbossa', src: barbossa },
  { id: 'davy_jones', name: 'Davy Jones', src: davyJones },
  { id: 'will_turner', name: 'Will Turner', src: willTurner },
  { id: 'elizabeth_swann', name: 'Elizabeth Swann', src: elizabethSwann },
  { id: 'tia_dalma', name: 'Tia Dalma', src: tiaDalma },
  { id: 'gibbs', name: 'Joshamee Gibbs', src: gibbs },
  { id: 'angelica', name: 'Angelica Teach', src: angelica },
  { id: 'pintel', name: 'Pintel', src: pintel },
  { id: 'ragetti', name: 'Ragetti', src: ragetti },
  { id: 'jack_monkey', name: 'Jack the Monkey', src: jackMonkey },
];

export const AVATAR_MAP = {
  jack_sparrow: jackSparrow,
  barbossa: barbossa,
  davy_jones: davyJones,
  will_turner: willTurner,
  elizabeth_swann: elizabethSwann,
  tia_dalma: tiaDalma,
  gibbs: gibbs,
  angelica: angelica,
  pintel: pintel,
  ragetti: ragetti,
  jack_monkey: jackMonkey,

  // Fallback mappings for old emoji strings if present
  '🧑‍✈️': jackSparrow,
  '🏴‍☠️': barbossa,
  '🐙': davyJones,
  '👨‍🍳': gibbs,
  '👩‍🔧': elizabethSwann,
  '🥷': willTurner,
  '🧟‍♂️': pintel,
  '🧜‍♀️': tiaDalma,
  '⚓': angelica,
  '🦈': ragetti,
};

export const getAvatarSrc = (avatarId) => {
  if (!avatarId) return jackSparrow;
  return AVATAR_MAP[avatarId] || jackSparrow;
};
