// Listes de mots et phrases en français (accents retirés à la génération pour
// rester compatible de toutes les dispositions de clavier).
// Exposé via globalThis pour fonctionner aussi bien en navigateur qu'en test Node.
globalThis.WORDS_FR = [
  "le","la","les","un","une","des","du","de","et","est","en","au","aux","dans","pour","sur","avec","sans","par","ce","cet","cette","ces","son","sa","ses","mon","ma","mes","ton","ta","tes","notre","nos","votre","vos","leur","leurs","il","elle","ils","elles","nous","vous","je","tu","on","qui","que","quoi","dont","ou","mais","ou","donc","ni","car","si","ne","pas","plus","moins","très","bien","mal","ici","là","y","aussi","encore","alors","quand","pendant","depuis","avant","après","tôt","tard","vite","lentement","aujourd'hui","demain","hier","maintenant","toujours","souvent","parfois","jamais","ensemble","seul","tout","tous","toute","toutes","rien","quelque","chose","beaucoup","peu","assez","trop","autre","autres","même","mêmes","oui","non","peut-être","oui","voici","voilà","bonjour","merci","s'il","vous","plait","excusez","moi","comment","allez","bonsoir","bonne","nuit",
  "maison","arbre","livre","table","chaise","fenêtre","porte","route","ville","village","montagne","rivière","mer","soleil","lune","étoile","nuage","pluie","vent","neige","jour","nuit","matin","soir","heure","minute","semaine","mois","année","temps","monde","pays","gens","homme","femme","enfant","ami","amie","famille","père","mère","frère","sœur","école","professeur","élève","étudiant","travail","bureau","ordinateur","clavier","souris","écran","téléphone","voiture","train","avion","bateau","vélo","pied","main","doigt","œil","nez","bouche","oreille","tête","cœur","bras","jambe","campagne","forêt","champ","jardin","parc","rue","pont","banque","magasin","restaurant","café","hôtel","église","musée","théâtre","cinéma","stade","piscine","plage","port","aéroport","gare","hôpital","pharmacie","boulangerie","poste","jardin","champ","pré","vallée","colline","fleuve","lac","île","plage","désert","glacier","volcan",
  "grand","petit","beau","bon","mauvais","nouveau","vieux","jeune","rapide","lent","facile","difficile","intéressant","ennuyeux","drôle","sérieux","content","triste","fatigué","chaud","froid","ouvert","fermé","plein","vide","lourd","léger","haut","bas","long","court","large","étroit","clair","sombre","propre","sale","dur","doux","fort","faible","riche","pauvre","heureux","malheureux","calme","bruyant","proche","lointain","prochain","dernier","premier","important","possible","impossible","vrai","faux","joli","moche","agréable","désagréable","célèbre","inconnu","courageux","peureux","généreux","égoïste","poli","grossier","sage","fou","malin","bête","propre","sale",
  "aller","venir","partir","arriver","entrer","sortir","monter","descendre","courir","marcher","dormir","manger","boire","parler","écouter","regarder","voir","entendre","penser","croire","savoir","pouvoir","vouloir","aimer","adorer","détester","chercher","trouver","perdre","gagner","donner","prendre","mettre","poser","ouvrir","fermer","commencer","finir","attendre","espérer","choisir","décider","apprendre","comprendre","enseigner","écrire","lire","compter","jouer","travailler","voyager","visiter","habiter","naître","mourir","vivre","devenir","rester","tenir","porter","aider","demander","répondre","appeler","rappeler","oublier","se souvenir","pleurer","rire","sourire","chanter","danser","nager","voler","conduire","acheter","vendre","payer","coûter","mesurer","peser","compter","compter","raconter","expliquer","montrer","cacher","chercher","trouver","casser","réparer","construire","détruire","nettoyer","salir","remplir","vider","porter","tirer","pousser","lancer","attraper","lâcher","serrer","lâcher",
  "zéro","un","deux","trois","quatre","cinq","six","sept","huit","neuf","dix","onze","douze","treize","quatorze","quinze","seize","vingt","trente","quarante","cinquante","soixante","cent","mille","million","milliard","premier","deuxième","troisième","dernier",
  "rouge","orange","jaune","vert","bleu","violet","rose","noir","blanc","gris","marron","rose","turquoise","argent","or",
  "lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche","janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"
];

globalThis.PHRASES_FR = [
  "Le chat dort paisiblement sur le canapé du salon.",
  "Il fait beau aujourd'hui, le soleil brille dans le ciel bleu.",
  "Je voudrais un café et un croissant, s'il vous plaît.",
  "La pluie tombe doucement sur les toits de la ville.",
  "Apprendre à taper vite demande de la pratique chaque jour.",
  "Les oiseaux chantent dans les grands arbres le matin.",
  "Ma sœur habite à Paris depuis déjà trois ans.",
  "Nous allons au cinéma samedi soir avec des amis.",
  "Le petit garçon joue au ballon dans le jardin.",
  "Il faut bien fermer la porte avant de partir.",
  "Les élèves travaillent sérieusement dans la salle de classe.",
  "Le train arrive à la gare dans dix petites minutes.",
  "J'aime lire des livres passionnants avant de dormir.",
  "La musique rend les soirées beaucoup plus agréables.",
  "Il a oublié ses clés sur la table de la cuisine.",
  "Nous avons visité un musée très intéressant hier après-midi.",
  "Ce restaurant propose un menu vraiment délicieux.",
  "Elle conduit sa voiture tous les jours pour aller travailler.",
  "Le film commence à vingt heures pile.",
  "Les enfants rient en jouant dans la neige fraîche.",
  "Apprends tes leçons ce soir, demain il y a un contrôle.",
  "Le vieux monsieur promène son chien dans le parc chaque matin.",
  "Il faut arroser les plantes du jardin quand il fait chaud.",
  "Cette vieille chanson me rappelle mon enfance heureuse.",
  "Le professeur explique la leçon avec beaucoup de patience.",
  "Mon frère aîné étudie la médecine à l'université.",
  "En hiver, la montagne est couverte de neige blanche.",
  "Elle écrit une longue lettre à sa grand-mère chaque mois.",
  "Le cuisinier prépare un délicieux repas pour ce soir.",
  "Nous devons partir tôt demain matin pour éviter les embouteillages.",
  "Il range sa chambre avant que ses parents n'arrivent.",
  "La petite fille dessine un beau paysage avec ses crayons de couleur."
];
