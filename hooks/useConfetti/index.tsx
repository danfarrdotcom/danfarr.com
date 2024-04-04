import { useCallback, useState } from 'react';
import { emoji, EmojiConfig, getContainerById } from '../../components/emoji';
// import { emoji } from '../../components/Emoji/Emoji';
// import { balloons } from '../../components/Balloons/Balloons';
// import { UseRewardType } from './useConfetti.types';
// import { getContainerById } from '../../functions/helpers';

// import { EmojiConfig } from '../../components/Emoji/Emoji.types';
// import { BalloonsConfig } from '../../components/Balloons/Balloons.types';

export interface RewardConfigs {
  //   confetti: ConfettiConfig;
  emoji: EmojiConfig;
  //   balloons: BalloonsConfig;
}

export type RewardType = keyof RewardConfigs;

export type RewardFunction = {
  reward: () => void;
  isAnimating: boolean;
};

export type UseRewardType = <T extends RewardType>(
  id: string,
  type: T,
  config?: RewardConfigs[T]
) => RewardFunction;

const useConfetti: UseRewardType = (id, type, config) => {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const internalAnimatingCallback = () => {
    setIsAnimating(false);
  };

  const reward = useCallback(() => {
    const foundContainer = getContainerById(id);
    if (!foundContainer) return;
    setIsAnimating(true);
    switch (type) {
      //   case 'confetti':
      //     Confetti(foundContainer, internalAnimatingCallback, config);
      //     break;
      case 'emoji':
        console.log('klflfl');
        emoji(foundContainer, internalAnimatingCallback, config);
        break;
      //   case 'balloons':
      //     balloons(foundContainer, internalAnimatingCallback, config);
      //     break;
      default:
        console.error(`${type} is not a valid react-rewards type.`);
    }
  }, [config, id, type]);

  return { reward, isAnimating };
};

export default useConfetti;
