import React, { useState, useEffect } from 'react';
import { Alert, FlatList } from 'react-native';
import { firebase } from '../../../firebase';
import { Container, Header, Title } from './styles';

import { OrderCard, OrderProps } from '@components/OrderCard';
import { ItemSeparator } from '@components/ItemSeparator';
import { useAuth } from '@hooks/auth';

export function Orders() {
    const [orders, setOrders] = useState<OrderProps[]>([]);
    const { user } = useAuth();
    useEffect(() => {
        const subscribe = firebase.firestore()
            .collection('orders')
            .where('waiter_id', '==', user?.id)
            .onSnapshot((querySnapshot: any) => {
                const data = querySnapshot.docs.map((doc: any) => {
                    return {
                        id: doc.id,
                        ...doc.data()
                    }
                }) as OrderProps[];
                setOrders(data);
            });
        return () => subscribe();
    }, []);

    function handlePizzaDelivered(id: string) {
        Alert.alert('Pedido', 'Confirmar que a pizza foi entregue na mesa?', [
            {
                text: 'Não',
                style: 'cancel'
            },
            {
                text: 'Sim',
                onPress: () => {
                    firebase.firestore().collection('orders').doc(id).update({ status: 'Entregue' })
                }
            }
        ]);
    }

    return (
        <Container>
            <Header>
                <Title>Pedidos feitos</Title>
            </Header>

            <FlatList
                data={orders}
                keyExtractor={item => item.id}
                renderItem={({ item, index }) => (
                    <OrderCard
                        index={index}
                        data={item}
                        disabled={item.status === 'Entregue'}
                        onPress={() => handlePizzaDelivered(item.id)}
                    />
                )}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 125 }}
                ItemSeparatorComponent={() => <ItemSeparator />}
            />
        </Container>
    )
}
