export interface PresetDeck {
  name: string;
  description: string;
  language: string;
  count: number;
  content: string;
}

export const SAMPLE_DECKS: PresetDeck[] = [
  {
    name: 'German Essentials (A1)',
    description: 'Everyday vocabulary starting with family and everyday nouns',
    language: 'de-DE',
    count: 25,
    content: `der Vater - Father
die Mutter - Mother
das Kind - Child
der Sohn - Son
die Tochter - Daughter
das Haus - House
die Schule - School
das Buch - Book
der Hund - Dog
die Katze - Cat
das Wasser - Water
das Brot - Bread
der Apfel - Apple
die Zeit - Time
der Tag - Day
die Nacht - Night
die Sonne - Sun
der Mond - Moon
die Stadt - City
das Auto - Car
die Arbeit - Work
die Frage - Question
die Antwort - Answer
die Freude - Joy
die Ruhe - Calm / Peace`,
  },
  {
    name: 'German High-Frequency Verbs',
    description: 'Essential German core verbs',
    language: 'de-DE',
    count: 20,
    content: `sein - to be
haben - to have
werden - to become
können - can / to be able to
müssen - must / to have to
sagen - to say
machen - to do / to make
geben - to give
kommen - to come
gehen - to go
wissen - to know (facts)
sehen - to see
lassen - to let / allow
stehen - to stand
finden - to find
bleiben - to stay / remain
liegen - to lie (horizontal)
heißen - to be called
denken - to think
nehmen - to take`,
  },
  {
    name: 'Spanish Core Vocabulary',
    description: 'Common Spanish words with slash separator',
    language: 'es-ES',
    count: 20,
    content: `el padre / father
la madre / mother
el hermano / brother
la casa / house
el perro / dog
el gato / cat
el libro / book
el agua / water
la comida / food
el tiempo / time / weather
la noche / night
el sol / sun
el cielo / sky
el camino / path / road
la verdad / truth
la vida / life
el amigo / friend
la ciudad / city
el corazón / heart
el trabajo / work`,
  },
  {
    name: 'French 20 Starter Words',
    description: 'Fundamental French everyday words',
    language: 'fr-FR',
    count: 20,
    content: `le père - father
la mère - mother
l'enfant - child
la maison - house
le chien - dog
le chat - cat
le livre - book
l'eau - water
le pain - bread
le temps - time / weather
le jour - day
la nuit - night
le soleil - sun
la ville - city
la voiture - car
le travail - work
le monde - world
la vie - life
l'ami - friend
l'arbre - tree`,
  },
];
