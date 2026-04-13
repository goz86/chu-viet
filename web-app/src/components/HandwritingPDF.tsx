import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'NanumGothic',
  src: 'https://fonts.gstatic.com/ea/nanumgothic/v5/NanumGothic-Regular.ttf',
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'NanumGothic',
    backgroundColor: '#ffffff'
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    color: '#335272',
    marginBottom: 40,
  },
  sentenceWrap: {
    marginBottom: 15,
    width: '100%',
  },
  wordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    alignItems: 'center',
  },
  targetWordBox: {
    justifyContent: 'center',
    marginRight: 6,
  },
  targetWordText: {
    color: '#000000',
  },
  gridBox: {
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
    marginBottom: 2,
  },
  gridText: {
    color: '#D1D9E6',
  },
  exampleSentence: {
    flex: 1,
    color: '#787878',
    marginLeft: 6,
  }
});

interface Props {
  text: string;
  fontSize: number;
  gridHeight: number;
  numGrids: number;
  strokeColor: string;
}

export const HandwritingPDF: React.FC<Props> = ({ text, fontSize, gridHeight, numGrids, strokeColor }) => {
  const sentences = text.split('\n').map(s => s.trim()).filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>한국어 쓰기 연습 · Handwriting Practice</Text>

        {sentences.map((sentence, sIdx) => {
          const words = sentence.split(' ');
          
          return (
            <View key={sIdx} style={styles.sentenceWrap}>
              {words.map((word, wIdx) => {
                // Approximate word visual width (plus padding)
                const charWidthApprox = fontSize * 0.7; // average width of CJK character
                const wordWidth = Math.max(gridHeight, word.length * charWidthApprox + 6);

                return (
                  <View key={wIdx} style={styles.wordContainer}>
                    {/* Target Word */}
                    <View style={[styles.targetWordBox, { minWidth: wordWidth, minHeight: gridHeight }]}>
                      <Text style={[styles.targetWordText, { fontSize }]}>{word}</Text>
                    </View>

                    {/* Grids */}
                    {Array.from({ length: numGrids }).map((_, i) => (
                      <View 
                        key={i} 
                        style={[
                          styles.gridBox, 
                          { width: wordWidth, height: gridHeight, borderColor: strokeColor }
                        ]}
                      >
                        {i < 3 && (
                          <Text style={[styles.gridText, { fontSize: fontSize * 0.8, paddingTop: 1 }]}>
                            {word}
                          </Text>
                        )}
                      </View>
                    ))}

                    {/* Original Sentence placed after */}
                    <Text 
                      style={[styles.exampleSentence, { fontSize: fontSize * 0.5, maxHeight: gridHeight }]}
                    >
                      {sentence}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </Page>
    </Document>
  );
};
