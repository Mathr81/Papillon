import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import { useTheme } from "@react-navigation/native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { GradeTitle } from "./Atoms/GradeTitle";
import { Asterisk, Calculator, Scale, School, UserMinus, UserPlus, Users } from "lucide-react-native";
import { getAverageDiffGrade } from "@/utils/grades/getAverages";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Grade } from "@/services/shared/Grade";
import type { getAverageDiffGradeReturn } from "@/utils/grades/getAverages";
import { Screen } from "@/router/helpers/types";
import InsetsBottomView from "@/components/Global/InsetsBottomView";

const GradeDocument: Screen<"GradeDocument"> = ({ route, navigation }) => {
  const {
    grade,
    allGrades = []
  } = route.params;
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [subjectData, setSubjectData] = useState({
    color: "#888888", pretty: "Matière inconnue", emoji: "❓",
  });

  const fetchSubjectData = () => {
    const data = getSubjectData(grade.subjectName);
    setSubjectData(data);
  };

  useEffect(() => {
    fetchSubjectData();
  }, [grade.subjectName]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Note en " + subjectData.pretty,
    });
  }, [navigation, subjectData]);

  const [gradeDiff, setGradeDiff] = useState({} as getAverageDiffGradeReturn);
  const [classDiff, setClassDiff] = useState({} as getAverageDiffGradeReturn);

  useEffect(() => {
    const gD = getAverageDiffGrade([grade], allGrades, "student") as getAverageDiffGradeReturn;
    const cD = getAverageDiffGrade([grade], allGrades, "average") as getAverageDiffGradeReturn;

    setGradeDiff(gD);
    setClassDiff(cD);
  }, [grade]);

  const lists = [
    {
      title: "Informations",
      items: [
        {
          icon: <Asterisk />,
          title: "Coefficient",
          description: "Coefficient de la matière",
          value: "x" + parseFloat(grade.coefficient).toFixed(2),
        },
        grade.outOf.value !== 20 && !grade.student.disabled && {
          icon: <Calculator />,
          title: "Remis sur /20",
          description: "Valeur recalculée sur 20",
          value: parseFloat(grade.student.value / grade.outOf.value * 20).toFixed(2),
          bareme: "/20",
        }
      ],
    },
    {
      title: "Moyennes",
      items: [
        {
          icon: <Users />,
          title: "Note moyenne",
          description: "Moyenne de la classe",
          value: parseFloat(grade.average.value).toFixed(2),
          bareme: "/" + grade.outOf.value,
        },
        {
          icon: <UserPlus />,
          title: "Note maximale",
          description: "Meilleure note de la classe",
          value: parseFloat(grade.max.value).toFixed(2),
          bareme: "/" + grade.outOf.value,
        },
        {
          icon: <UserMinus />,
          title: "Note minimale",
          description: "Moins bonne note de la classe",
          value: parseFloat(grade.min.value).toFixed(2),
          bareme: "/" + grade.outOf.value,
        }
      ]
    },
    {
      title: "Influence",
      items: [
        !grade.student.disabled && {
          icon: <Scale />,
          title: "Moyenne générale",
          description: "Impact de la note sur la moyenne générale",
          value:
            (gradeDiff.difference > 0 ? "+ " : "- ") +
            parseFloat(gradeDiff.difference).toFixed(2).replace("-", "") + " pts",
          color: gradeDiff.difference > 0 ? "#00C853" : "#FF1744",
        },
        !grade.average.disabled && {
          icon: <School />,
          title: "Moyenne de la classe",
          value:
            (classDiff.difference > 0 ? "+ " : "- ") +
            parseFloat(classDiff.difference).toFixed(2).replace("-", "") + " pts",
        }
      ]
    }
  ];

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: 16,
        paddingTop: 0,
      }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <GradeTitle grade={grade} subjectData={subjectData} />

      {lists.map((list, index) => (
        <View key={index}>
          <NativeListHeader label={list.title} />

          <NativeList>
            {list.items.filter(Boolean).map((item, index) => (
              <NativeItem
                key={index}
                icon={item.icon || null}
                trailing={
                  <View
                    style={{
                      marginRight: 10,
                      alignItems: "flex-end",
                      flexDirection: "row",
                      gap: 2,
                    }}
                  >
                    <NativeText
                      style={{
                        fontSize: 18,
                        lineHeight: 22,
                        fontFamily: "semibold",
                        color: item.color || theme.colors.text,
                      }}
                    >
                      {item.value}
                    </NativeText>
                    {item.bareme &&
                    <NativeText variant="subtitle">
                      {item.bareme}
                    </NativeText>
                    }
                  </View>
                }
              >
                <NativeText variant="overtitle">
                  {item.title}
                </NativeText>
                {item.description &&
                <NativeText variant="subtitle">
                  {item.description}
                </NativeText>
                }
              </NativeItem>
            ))}
          </NativeList>
        </View>
      ))}

      <InsetsBottomView />

    </ScrollView>
  );
};

export default GradeDocument;