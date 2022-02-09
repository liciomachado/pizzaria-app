import React, { useState } from 'react';
import { Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { firebase } from '../../../firebase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import storage from '@firebase/storage';

import { ButtonBack } from '@components/ButtonBack';
import { Container, Header, Title, DeleteLabel, Upload, PickImageButton, Label, InputGroup, InputGroupHeader, MaxCharacters, Form } from './styles';
import { Input } from '@components/Input';
import { Photo } from '@components/Photo';
import { Button } from '@components/Button';

import { InputPrice } from '@components/InputPrice';

export function Product() {
    const [image, setImage] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [priceSizeP, setPriceSizeP] = useState('');
    const [priceSizeM, setPriceSizeM] = useState('');
    const [priceSizeG, setPriceSizeG] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
        const reference = firebase.storage().ref(`/pizzas`).child(new Date().toISOString());
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
            .then(() => Alert.alert('Cadastro', 'Pizza cadastrada com sucesso'))
            .catch(() => Alert.alert('Cadastro', 'Não foi possível cadastrar a pizza'))

        setIsLoading(false);
    }

    return (
        <Container behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Header>
                <ButtonBack />

                <Title>Cadastrar</Title>
                <TouchableOpacity>
                    <DeleteLabel>Deletar</DeleteLabel>
                </TouchableOpacity>
            </Header>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Upload>
                    <Photo uri={image} />

                    <PickImageButton
                        title='Carregar'
                        type="secondary"
                        onPress={handlePickerImage} />
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

                    <Button
                        title='Cadastrar piazza'
                        isLoading={isLoading}
                        onPress={handleAdd}
                    />

                </Form>
            </ScrollView>
        </Container >
    )
}
