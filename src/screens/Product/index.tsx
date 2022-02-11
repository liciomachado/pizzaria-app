import React, { useState, useEffect } from 'react';
import { Platform, TouchableOpacity, ScrollView, Alert, View } from 'react-native';
import { firebase } from '../../../firebase';
import * as ImagePicker from 'expo-image-picker';

import { useNavigation, useRoute } from '@react-navigation/native';
import { ProductNavigationProps } from '@src/@types/navigation';

import { ButtonBack } from '@components/ButtonBack';
import { Container, Header, Title, DeleteLabel, Upload, PickImageButton, Label, InputGroup, InputGroupHeader, MaxCharacters, Form } from './styles';
import { Input } from '@components/Input';
import { Photo } from '@components/Photo';
import { Button } from '@components/Button';
import { ProductProps } from '@components/ProductCard';

import { InputPrice } from '@components/InputPrice';

type PizzaResponse = ProductProps & {
    photo_path: string;
    price_sizes: {
        p: string;
        m: string;
        g: string;
    }
}

export function Product() {
    const navigation = useNavigation();

    const [photoPath, setPhotoPath] = useState('');
    const [image, setImage] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [priceSizeP, setPriceSizeP] = useState('');
    const [priceSizeM, setPriceSizeM] = useState('');
    const [priceSizeG, setPriceSizeG] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const route = useRoute();
    const { id } = route.params as ProductNavigationProps;

    async function handlePickerImage() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status === 'granted') {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                aspect: [4, 4]
            });

            if (!result.cancelled)
                setImage(result.uri)
        }
    }

    async function handleAdd() {
        if (!name.trim())
            return Alert.alert('Cadastro', 'Informe o nome da pizza.');

        if (!description.trim())
            return Alert.alert('Cadastro', 'Informe a descrição da pizza.');

        if (!image)
            return Alert.alert('Cadastro', 'Informe a imagem da pizza.');

        if (!priceSizeP || !priceSizeM || !priceSizeG)
            return Alert.alert('Cadastro', 'Informe o preço de todos os tamanhos da pizza.');

        setIsLoading(true);

        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function () {
                reject(new TypeError("Network request failed"));
            }
            xhr.responseType = "blob";
            xhr.open("GET", image, true);
            xhr.send(null);
        })

        const fileName = new Date().getTime();
        const reference = firebase.storage().ref(`/pizzas/${fileName}.png`);
        const snapshot = await reference.put(blob as Blob);

        const photo_url = await reference.getDownloadURL();

        firebase
            .firestore()
            .collection('pizzas')
            .add({
                name,
                name_insensitive: name.toLowerCase().trim(),
                description,
                price_sizes: {
                    p: priceSizeP,
                    m: priceSizeM,
                    g: priceSizeG
                },
                photo_url,
                photo_path: reference.fullPath
            })
            .then(() => navigation.navigate('home'))
            .catch(() => {
                setIsLoading(false);
                Alert.alert('Cadastro', 'Não foi possível cadastrar a pizza');
            })

    }

    const handleGoBack = () => navigation.goBack();

    function handleDelete() {
        firebase
            .firestore()
            .collection('pizzas')
            .doc(id)
            .delete()
            .then(() => {
                firebase.storage()
                    .ref(photoPath)
                    .delete()
                    .then(() => navigation.navigate('home'));
            })
    }

    useEffect(() => {
        if (id) {
            firebase
                .firestore()
                .collection('pizzas')
                .doc(id)
                .get()
                .then((response: any) => {
                    const product = response.data() as PizzaResponse;

                    setName(product.name);
                    setImage(product.photo_url);
                    setDescription(product.description);
                    setPriceSizeP(product.price_sizes.p);
                    setPriceSizeM(product.price_sizes.m);
                    setPriceSizeG(product.price_sizes.g);
                    setPhotoPath(product.photo_path);
                })
        }
    }, [id])

    return (
        <Container behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Header>
                <ButtonBack onPress={handleGoBack} />

                <Title>Cadastrar</Title>
                {id ? <TouchableOpacity onPress={handleDelete}>
                    <DeleteLabel>Deletar</DeleteLabel>
                </TouchableOpacity>
                    : <View style={{ width: 20 }}></View>}
            </Header>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Upload>
                    <Photo uri={image} />

                    {!id && <PickImageButton
                        title='Carregar'
                        type="secondary"
                        onPress={handlePickerImage} />}
                </Upload>

                <Form>
                    <InputGroup>
                        <Label>Nome</Label>
                        <Input onChangeText={setName} value={name} />
                    </InputGroup>

                    <InputGroup>
                        <InputGroupHeader>
                            <Label>Descrição</Label>
                            <MaxCharacters>0 de 60 caracteres</MaxCharacters>
                        </InputGroupHeader>
                        <Input
                            multiline
                            maxLength={60}
                            style={{ height: 80 }}
                            onChangeText={setDescription}
                            value={description}
                        />
                    </InputGroup>

                    <InputGroup>
                        <Label>Tamanhos e preços</Label>

                        <InputPrice size='P'
                            onChangeText={setPriceSizeP}
                            value={priceSizeP}
                        />
                        <InputPrice size='M'
                            onChangeText={setPriceSizeM}
                            value={priceSizeM}
                        />
                        <InputPrice size='G'
                            onChangeText={setPriceSizeG}
                            value={priceSizeG}
                        />

                    </InputGroup>

                    {!id && <Button
                        title='Cadastrar piazza'
                        isLoading={isLoading}
                        onPress={handleAdd}
                    />}

                </Form>
            </ScrollView>
        </Container >
    )
}
