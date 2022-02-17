import React, { useState, useCallback } from 'react';
import { Alert, TouchableOpacity, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Container, Header, Greeting, GreetingEmoji, GreetingText, MenuHeader, MenuItemsNumber, Title, NewProductButton } from './styles';
import happyEmoji from '@assets/happy.png';
import { firebase } from '../../../firebase';

import { useTheme } from 'styled-components/native';

import { Search } from '@components/Search';
import { ProductCard, ProductProps } from '@components/ProductCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@hooks/auth';

export function Home() {
    const { signOut, user } = useAuth();
    const [pizzas, setPizzas] = useState<ProductProps[]>([]);
    const [search, setSearch] = useState('');

    const navigation = useNavigation();
    const { COLORS } = useTheme();

    function fetchPizzas(value: string) {
        const formattedValue = value.toLocaleLowerCase().trim();

        firebase
            .firestore()
            .collection('pizzas')
            .orderBy('name_insensitive')
            .startAt(formattedValue)
            .endAt(`${formattedValue}\uf8ff`)
            .get()
            .then((response: any) => {
                const data = response.docs.map((doc: any) => {
                    return {
                        id: doc.id,
                        ...doc.data(),
                    }
                }) as ProductProps[];

                setPizzas(data)
            })
            .catch(() => Alert.alert('Consulta', 'Não foi possível realizar a consulta'));
    }

    function handleSearch() {
        fetchPizzas(search);
    }

    function handleSearchClear() {
        setSearch('');
        fetchPizzas('');
    }

    function handleOpen(id: string) {
        const route = user?.isAdmin ? 'product' : 'order';
        navigation.navigate(route, { id });
    }

    const handleAdd = () => navigation.navigate('product', {})


    useFocusEffect(
        useCallback(() => {
            fetchPizzas('');
        }, [])
    );

    return (
        <Container>
            <Header>
                <Greeting>
                    <GreetingEmoji source={happyEmoji} />
                    <GreetingText>Olá, admin</GreetingText>
                </Greeting>

                <TouchableOpacity>
                    <MaterialIcons name='logout' color={COLORS.TITLE} size={24} onPress={signOut} />
                </TouchableOpacity>
            </Header>
            <Search
                onChangeText={setSearch}
                value={search}
                onSearch={handleSearch}
                onClear={handleSearchClear}
            />

            <MenuHeader>
                <Title>Cardápio</Title>
                <MenuItemsNumber>{pizzas.length} pizzas</MenuItemsNumber>
            </MenuHeader>

            <FlatList
                data={pizzas}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <ProductCard
                        data={item}
                        onPress={() => handleOpen(item.id)}
                    />)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: 20,
                    paddingBottom: 125,
                    marginHorizontal: 24
                }}
            />

            {user?.isAdmin && <NewProductButton
                title="Cadastrar Pizza"
                type="secondary"
                onPress={handleAdd}
            />}

        </Container>
    )
}
