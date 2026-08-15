import galleFortImage from "../assets/destinations/galle-fort.png";
import hortonPlainsImage from "../assets/destinations/horton-plains.png";
import sigiriyaImage from "../assets/destinations/sigiriya.png";
import templeOfToothImage from "../assets/destinations/temple-of-tooth.png";

const localImages: Record<string, string> = {
  "galle fort": galleFortImage,
  "horton plains": hortonPlainsImage,
  "sigiriya": sigiriyaImage,
  "sigiriya rock fortress": sigiriyaImage,
  "temple of tooth": templeOfToothImage,
  "temple of the tooth": templeOfToothImage,
  "temple of tooth relic": templeOfToothImage,
  "temple of the tooth relic": templeOfToothImage,
};

const premiumRemoteImages: Record<string, string> = {
  "galle fort":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Galle_Fort_Lighthouse.jpg/1280px-Galle_Fort_Lighthouse.jpg",

  "horton plains":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Horton_Plains_Sri_Lanka.jpg/1280px-Horton_Plains_Sri_Lanka.jpg",

  "sigiriya":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Sigiriya_Rock_Fortress.jpg/1280px-Sigiriya_Rock_Fortress.jpg",

  "sigiriya rock fortress":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Sigiriya_Rock_Fortress.jpg/1280px-Sigiriya_Rock_Fortress.jpg",

  "temple of tooth":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Temple_of_Tooth_-_Kandy%2C_Srilanka.jpg/1280px-Temple_of_Tooth_-_Kandy%2C_Srilanka.jpg",

  "temple of the tooth":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Temple_of_Tooth_-_Kandy%2C_Srilanka.jpg/1280px-Temple_of_Tooth_-_Kandy%2C_Srilanka.jpg",

  "temple of tooth relic":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Temple_of_Tooth_-_Kandy%2C_Srilanka.jpg/1280px-Temple_of_Tooth_-_Kandy%2C_Srilanka.jpg",

  "temple of the tooth relic":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Temple_of_Tooth_-_Kandy%2C_Srilanka.jpg/1280px-Temple_of_Tooth_-_Kandy%2C_Srilanka.jpg",
};

function normalizeName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function getDestinationImageCandidates(
  name: string,
  databaseImageUrl?: string | null
): string[] {
  const normalized =
    normalizeName(name);

  return Array.from(
    new Set(
      [
        databaseImageUrl?.trim() || "",
        premiumRemoteImages[normalized] || "",
        localImages[normalized] || "",
      ].filter(Boolean)
    )
  );
}
