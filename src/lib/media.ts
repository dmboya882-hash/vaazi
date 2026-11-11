// Editorial photography for the home page. These are free-licence stock
// placeholders (Unsplash / Pexels licences allow commercial use), hotlinked.
// Replace them with your own campaign photos when you have them.

export type Photo = { src: string; alt: string; credit?: string };

const unsplash = (id: string, w = 1800) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
const pexels = (id: number, w = 2000) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const media = {
  // Full-screen hero behind the VAAZI wordmark (wide landscape)
  campaign: {
    src: pexels(4612681, 2400),
    alt: "Two men in dark suits standing on a sandy ridge under a wide sky",
    credit: "Gugulethu Ndlalani / Pexels",
  } as Photo,
  // Portrait version of the hero for phones
  campaignMobile: {
    src: pexels(30643295, 1200),
    alt: "Man in a black coat standing in tall dry grass",
    credit: "Kofi Shelby / Pexels",
  } as Photo,
  editorial: {
    main: {
      src: unsplash("1792058577815-7a605d141a6d", 1400),
      alt: "Man in a long black robe standing barefoot on desert dunes",
      credit: "Emmanuel Black / Unsplash",
    } as Photo,
    row: [
      { src: pexels(5839957, 1200), alt: "Young man in profile against eroded earth cliffs", credit: "cottonbro studio / Pexels" },
      { src: pexels(35564246, 1200), alt: "Two men in tailored suits standing in tall grass", credit: "LekePOV / Pexels" },
      { src: pexels(30643295, 1200), alt: "Man in a black coat among tall dry grass", credit: "Kofi Shelby / Pexels" },
    ] as Photo[],
  },
  thrift: {
    src: unsplash("1579921562939-d9cc7a7dbd8e", 1400),
    alt: "Man in a long brown overcoat against dry brush",
    credit: "Seyi Ariyo / Unsplash",
  } as Photo,
};
