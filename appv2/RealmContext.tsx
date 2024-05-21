// RealmContext.js
import React, { createContext, useContext } from 'react';
import Realm from 'realm';
import { UserSchema } from './UserSchema'; // Assuming you have a UserSchema defined

export const RealmContext = createContext(null);

export const RealmProvider = ({ children }) => {
  const [realm, setRealm] = React.useState(null);

  React.useEffect(() => {
    const initRealm = async () => {
      const realmInstance = await Realm.open({
        path: 'myRealm',
        schema: [UserSchema],
      });
      setRealm(realmInstance);
    };

    initRealm();

    return () => {
      if (realm) {
        realm.close();
      }
    };
  }, []);

  return (
    <RealmContext.Provider value={realm}>
      {children}
    </RealmContext.Provider>
  );
};

export const useRealm = () => useContext(RealmContext);
