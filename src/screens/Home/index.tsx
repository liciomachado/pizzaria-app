import React from 'react';
import { TouchableOpacity } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
import happyEmoji from '@assets/happy.png';

import { useTheme } from 'styled-components/native';
import { Container, Header, Greeting, GreetingEmoji, GreetingText, } from './styles';

import { Search } from '@components/Search';

export function Home() {
    const { COLORS } = useTheme();
    return (
        <Container>
            <Header>
                <Greeting>
                    <GreetingEmoji source={happyEmoji} />
                    <GreetingText>Olá, admin</GreetingText>
                </Greeting>

                <TouchableOpacity>
                    <MaterialIcons name='logout' color={COLORS.TITLE} size={24} />
                </TouchableOpacity>
            </Header>
            <Search
                onSearch={() => { }}
                onClear={() => { }}
            />
        </Container>
    )
}
