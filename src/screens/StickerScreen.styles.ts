import { StyleSheet } from 'react-native';

export const BLUE = '#15397F';
export const RED = '#D7263D';
export const WHITE = '#FFFFFF';

export const COLORS = ['#FFFFFF', '#000000', '#FFD700', '#FF6B6B', '#4ECDC4', '#15397F', '#D7263D', '#2ECC71'];
export const BG_COLORS = ['transparent', '#FFD700', '#FF6B6B', '#4ECDC4', '#15397F', '#000000', '#FFFFFF', '#2ECC71'];

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE, padding: 16 },
  title: { fontSize: 18, fontWeight: '800', color: BLUE, marginBottom: 16, marginTop: 8, textAlign: 'center' },
  preview: {
    width: 280, height: 280, alignSelf: 'center', borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    overflow: 'hidden', elevation: 4,
  },
  previewImage: { position: 'absolute', width: '100%', height: '100%' },
  stickerText: { fontWeight: '900', textAlign: 'center', padding: 16, textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 4 },
  card: { backgroundColor: '#F0F4FF', borderRadius: 12, padding: 16, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '700', color: BLUE, marginBottom: 8 },
  input: {
    backgroundColor: WHITE, borderRadius: 8, padding: 12,
    minHeight: 80, textAlignVertical: 'top', fontSize: 15, color: '#1a1a1a', marginBottom: 12,
  },
  sizeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  sizeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: WHITE, borderWidth: 1, borderColor: BLUE },
  sizeBtnActive: { backgroundColor: BLUE },
  sizeBtnText: { color: BLUE, fontWeight: '700' },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 12 },
  colorDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  colorDotSelected: { borderWidth: 3, borderColor: RED },
  btn: { backgroundColor: BLUE, padding: 12, borderRadius: 999, alignItems: 'center' },
  btnText: { color: WHITE, fontWeight: '700' },
  exportBtn: { backgroundColor: RED, padding: 16, alignItems: 'center', borderRadius: 8 },
  exportBtnText: { color: WHITE, fontWeight: '700', fontSize: 16 }
});
