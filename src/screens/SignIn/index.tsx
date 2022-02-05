import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import BrandImg from '@assets/brand.png';

import { Container, Content, Title, Brand, ForgotPasswordButton, ForgotPasswordLabel } from './styles';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { useAuth } from '@hooks/auth';

export function SignIn() {
    const { isLogging, signIn, forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    function handleSignIn() {
        signIn(email, password);
    }

    function handleForgotPassword() {
        forgotPassword(email);
    }

    return (
        <Container>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <Content>

                    <Brand source={BrandImg} />

                    <Title>Login</Title>
                    <Input
                        placeholder='E-mail'
                        type='secondary'
                        autoCorrect={false}
                        autoCapitalize='none'
                        onChangeText={setEmail}
                    />

                    <Input
                        style={{ marginTop: 20, marginBottom: 20 }}
                        placeholder='Senha'
                        type='secondary'
                        secureTextEntry
                        onChangeText={setPassword}
                    />

                    <ForgotPasswordButton onPress={handleForgotPassword}>
                        <ForgotPasswordLabel>
                            Esqueci minha senha
                        </ForgotPasswordLabel>
                    </ForgotPasswordButton>

                    <Button
                        title='Entrar'
                        type="secondary"
                        onPress={handleSignIn}
                        isLoading={isLogging}
                    />
                </Content>
            </KeyboardAvoidingView>
        </Container >
    )
}
