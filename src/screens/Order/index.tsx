import React, { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { firebase } from '../../../firebase';

import { Container, Header, Photo, Sizes, Form, FormRow, InputGroup, Label, Price, Title, ContentScroll } from './styles';
import { ButtonBack } from '@components/ButtonBack';
import { RadioButton } from '@components/RadioButton';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { ProductNavigationProps } from '@src/@types/navigation';
import { ProductProps } from '@src/components/ProductCard';

import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@hooks/auth';
import { PIZZA_TYPES } from '@utils/pizzaTypes';

type PizzaResponse = ProductProps & {
    price_sizes: {
        [key: string]: number;
    }
}

export function Order() {
    const { user } = useAuth();
    const [size, setSize] = useState('');
    const [pizza, setPizza] = useState<PizzaResponse>({} as PizzaResponse);
    const [quantity, setQuantity] = useState(0);
    const [tableNumber, setTableNumber] = useState('');
    const [sendingOrder, setSendingOrder] = useState(false);

    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params as ProductNavigationProps;

    const amount = size ? pizza.price_sizes[size] * quantity : '0,00';

    const handleGoBack = () => navigation.goBack();

    function handleOrder() {
        if (!size) {
            return Alert.alert('Pedido', 'Selecione o tamanho da pizza.');
        }

        if (!tableNumber) {
            return Alert.alert('Pedido', 'Informe o número da mesa.');
        }

        if (!quantity) {
            return Alert.alert('Pedido', 'Informe a quantidade.');
        }

        setSendingOrder(true);

        firebase
            .firestore()
            .collection('orders')
            .add({
                quantity,
                amount,
                pizza: pizza.name,
                size,
                table_number: tableNumber,
                status: 'Preparando',
                waiter_id: user?.id,
                image: pizza.photo_url
            })
            .then(() => navigation.navigate('home'))
            .catch(() => {
                Alert.alert('Pedido', 'Não foi possível realizar o pedido.');
                setSendingOrder(false);
            })
    }

    useEffect(() => {
        if (id) {
            firebase
                .firestore()
                .collection('pizzas')
                .doc(id)
                .get()
                .then((response: any) => setPizza(response.data() as PizzaResponse))
                .catch(() => Alert.alert('Pedido', 'Não foi possível carregar o produto'));
        }
    }, [])
    return (
        <Container behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ContentScroll>
                <Header>
                    <ButtonBack
                        onPress={handleGoBack}
                        style={{ marginBottom: 108 }}
                    />
                </Header>

                <Photo
                    source={{ uri: pizza.photo_url }}
                />

                <Form>
                    <Title>{pizza.name}</Title>
                    <Label>Selecione um tamanho</Label>
                    <Sizes>
                        {PIZZA_TYPES.map(item => (
                            <RadioButton
                                key={item.id}
                                title={item.name}
                                selected={size === item.id}
                                onPress={() => setSize(item.id)}
                            />
                        ))
                        }
                    </Sizes>

                    <FormRow>
                        <InputGroup>
                            <Label>Número da mesa</Label>
                            <Input keyboardType='numeric'
                                onChangeText={setTableNumber}
                            />
                        </InputGroup>

                        <InputGroup>
                            <Label>Quantidade</Label>
                            <Input keyboardType='numeric'
                                onChangeText={(value) => setQuantity(Number(value))}
                            />
                        </InputGroup>
                    </FormRow>

                    <Price>Valor de R$ {amount}</Price>

                    <Button
                        title="Confirmar pedido"
                        onPress={handleOrder}
                        isLoading={sendingOrder}
                    />
                </Form>
            </ContentScroll>
        </Container>
    )
}
