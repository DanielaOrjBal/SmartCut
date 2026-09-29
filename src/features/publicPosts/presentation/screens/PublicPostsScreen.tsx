import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSizes, radii, spacing, shadows } from '../../../../core/theme/tokens';
import { EstadoVacio } from '../../../../core/components/EstadoVacio';
import { PublicPost } from '../../domain/entities/PublicPost';
import { usePublicPostsViewModel } from '../viewModels/usePublicPostsViewModel';

type PublicPostsScreenProps = {
  onBack: () => void;
};

export function PublicPostsScreen({ onBack }: PublicPostsScreenProps) {
  const vm = usePublicPostsViewModel();

  function renderPost({ item }: { item: PublicPost }) {
    return (
      <View style={estilos.card}>
        <Text style={estilos.cardNumber}>Publicación {item.id}</Text>
        <Text style={estilos.cardTitle}>{item.title}</Text>
        <Text style={estilos.cardBody}>{item.body}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={estilos.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={estilos.header}>
        <Pressable onPress={onBack} style={estilos.backButton}>
          <Text style={estilos.backButtonText}>← Volver</Text>
        </Pressable>
        <Text style={estilos.title}>Publicaciones públicas</Text>
        <Text style={estilos.subtitle}>
          Información consultada desde un servicio web.
        </Text>
      </View>

      {vm.isLoading && (
        <View style={estilos.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={estilos.statusText}>Consultando el servicio web...</Text>
        </View>
      )}

      {!vm.isLoading && vm.errorMessage !== '' && (
        <View style={estilos.centered}>
          <Text style={estilos.errorText}>{vm.errorMessage}</Text>
          <Pressable style={estilos.retryButton} onPress={vm.reload}>
            <Text style={estilos.retryButtonText}>Intentar nuevamente</Text>
          </Pressable>
        </View>
      )}

      {!vm.isLoading && vm.errorMessage === '' && vm.posts.length === 0 && (
        <EstadoVacio
          icono="inbox"
          mensaje="El servicio web no devolvió publicaciones."
        />
      )}

      {!vm.isLoading && vm.errorMessage === '' && vm.posts.length > 0 && (
        <FlatList
          data={vm.posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPost}
          contentContainerStyle={estilos.listContent}
          scrollIndicatorInsets={{ right: 1 }}
        />
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  backButton: { alignSelf: 'flex-start', paddingVertical: spacing.sm },
  backButtonText: {
    fontSize: fontSizes.button,
    fontWeight: '700',
    color: colors.primary,
  },
  title: {
    marginTop: spacing.sm,
    fontSize: fontSizes.titleLarge,
    fontWeight: '700',
    color: colors.navy,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: fontSizes.body,
    color: colors.textMuted,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screen,
  },
  statusText: {
    marginTop: spacing.lg,
    fontSize: fontSizes.button,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: fontSizes.button,
    color: colors.danger,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  retryButtonText: {
    color: colors.surface,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardNumber: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  cardTitle: {
    marginTop: spacing.sm,
    fontSize: fontSizes.button,
    fontWeight: '700',
    color: colors.navy,
    textTransform: 'capitalize',
  },
  cardBody: {
    marginTop: spacing.md,
    fontSize: fontSizes.body,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
