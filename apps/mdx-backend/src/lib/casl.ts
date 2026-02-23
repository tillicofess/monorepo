import { createMongoAbility, type MongoAbility } from '@casl/ability';
import { createContextualCan } from '@casl/react';
import { createContext } from 'react';

export const AbilityContext = createContext<MongoAbility>(createMongoAbility());
export const Can = createContextualCan(AbilityContext.Consumer); //Consumer 是一个函数组件，用于消费 AbilityContext 提供的能力 useContext的旧版API
