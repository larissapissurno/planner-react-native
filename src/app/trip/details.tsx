import { View, Text, Alert, FlatList } from "react-native";
import { Button } from "../button";
import { Plus } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { Modal } from "@/components/modal";
import { useEffect, useState } from "react";
import { Input } from "@/components/input";
import { linksServer } from "@/server/links-server";
import { validateInput } from "@/utils/validateInput";
import { TripLink, TripLinkProps } from "@/components/tripLink";
import { participantsServer } from "@/server/participants-server";
import { Participant, ParticipantProps } from "@/components/participant";

enum MODAL {
  NONE = 0,
  NEW_LINK = 1,
}

export function TripDetails({ tripId }: { tripId: string }) {
  // MODAL
  const [showModal, setShowModal] = useState<MODAL>(MODAL.NONE);

  // DATA
  const [linkTitle, setLinkTitle] = useState<string>("");
  const [linkUrl, setLinkUrl] = useState<string>("");

  // LISTS
  const [links, setLinks] = useState<TripLinkProps[]>([]);
  const [guests, setGuests] = useState<ParticipantProps[]>([]);

  // LOADING
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  async function handleCreateLink() {
    try {
      if (!linkTitle?.trim() || !linkUrl?.trim()) {
        return Alert.alert("Novo link", "Preencha todos os campos");
      }

      if (!validateInput.url(linkUrl.trim())) {
        return Alert.alert("Novo link", "URL inválida");
      }

      setIsCreatingLink(true);

      await linksServer.create({
        tripId,
        title: linkTitle.trim(),
        url: linkUrl.trim(),
      });

      Alert.alert("Novo link", "Link criado com sucesso");

      resetLinkForm();
      setShowModal(MODAL.NONE);

      getTripLinks();
    } catch (error) {
      setIsCreatingLink(false);
      Alert.alert("Erro ao criar link", "Tente novamente mais tarde");
    } finally {
      setIsCreatingLink(false);
    }
  }

  function resetLinkForm() {
    setLinkTitle("");
    setLinkUrl("");
  }

  function getTripLinks() {
    linksServer.getLinksByTripId(tripId).then(setLinks);
  }

  function getTripGuests() {
    participantsServer.getByTripId(tripId).then(setGuests);
  }

  useEffect(() => {
    getTripLinks();
    getTripGuests();
  }, []);

  return (
    <View className="flex-1 mt-10">
      <Text className="text-zinc-50 text-2xl font-semibold mb-2">
        Links importantes
      </Text>

      <View className="flex-1">
        {links.length > 0 ? (
          <FlatList
            data={links}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TripLink data={item} />}
            contentContainerClassName="gap-4"
            ListFooterComponent={
              <Button
                variant="secondary"
                onPress={() => setShowModal(MODAL.NEW_LINK)}
              >
                <Plus color={colors.zinc[200]} size={20} />
                <Button.Title>Cadastrar novo link</Button.Title>
              </Button>
            }
          />
        ) : (
          <Text className="text-zinc-400 text-lg text-center mt-4">
            Nenhum link cadastrado
          </Text>
        )}
      </View>

      <View className="flex-1 border-t border-zinc-800 mt-6">
        <Text className="text-zinc-50 text-2xl font-semibold my-6">
          Convidados
        </Text>

        <FlatList
          data={guests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Participant data={item} />}
          contentContainerClassName="gap-4 pb-44"
        />
      </View>

      <Modal
        title="Cadastrar link"
        subtitle="Todos os convidados podem visualizar os links importantes."
        visible={showModal === MODAL.NEW_LINK}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="gap-2 mb-3">
          <Input variant="secondary">
            <Input.Field
              placeholder="Titulo"
              value={linkTitle}
              onChangeText={setLinkTitle}
            />
          </Input>

          <Input variant="secondary">
            <Input.Field
              placeholder="URL"
              value={linkUrl}
              onChangeText={setLinkUrl}
            />
          </Input>

          <Button
            variant="primary"
            className="mt-4"
            isLoading={isCreatingLink}
            onPress={handleCreateLink}
          >
            <Button.Title>Salvar Link</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
