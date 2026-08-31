import type { IconType } from 'react-icons';
import {
  AiOutlineHome,
  AiOutlineSafety,
  AiOutlineIdcard,
} from 'react-icons/ai';
import { FaHandsHelping, FaGavel, FaDog, FaEye } from 'react-icons/fa';
import { RiPsychotherapyLine } from 'react-icons/ri';

export const iconMapping: Record<string, IconType> = {
  'Domestic abuse support': FaHandsHelping,
  'Legal advice': FaGavel,
  'Immigration advice': AiOutlineIdcard,
  'Pet fostering': FaDog,
  'Honour based abuse': FaEye,
  'Stalking support': AiOutlineSafety,
  'Housing support': AiOutlineHome,
  'Counselling service': RiPsychotherapyLine,
};
