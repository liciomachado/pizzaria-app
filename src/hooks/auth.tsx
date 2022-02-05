import { firebase } from '../../firebase';
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { Alert } from 'react-native';

type User = {
    id: string;
    name: string;
    isAdmin: boolean;
}

type AuthContextData = {
    signIn: (email: string, password: string) => Promise<void>;
    isLogging: boolean;
    user: User | null;
}

type AuthProviderProps = {
    children: ReactNode;
}

const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
    const [isLogging, setIsLogging] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    async function signIn(email: string, password: string) {
        if (!email || !password)
            return Alert.alert('Login', 'Informe o e-mail e a senha.');

        setIsLogging(true);

        firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then((account: any) => {
                firebase.firestore()
                    .collection('users')
                    .doc(account.user.uid)
                    .get()
                    .then(profile => {
                        const { name, isAdmin } = profile.data() as User;

                        if (profile.exists) {
                            const userData = {
                                id: account.user.uid,
                                name,
                                isAdmin
                            };
                            console.log(userData);
                            setUser(userData);
                        };
                    })

            })
            .catch((error: any) => {
                const { code } = error;

                if (code === 'auth/user-not-found' || code === 'auth/wrong-password') {
                    return Alert.alert('Login', 'Email e/ou senha inválida.');
                } else {
                    return Alert.alert('Login', 'Não foi possivel realizar o login');
                }
            })
            .finally(() => setIsLogging(false));
    }

    return (
        <AuthContext.Provider value={{ isLogging, signIn, user }}>
            {children}
        </AuthContext.Provider>
    )
}

function useAuth() {
    const context = useContext(AuthContext);

    return context;
}

export { AuthProvider, useAuth };
