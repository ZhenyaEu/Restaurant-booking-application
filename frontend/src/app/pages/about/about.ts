import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Pillar {
  number: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrls: ['./about.scss']
})
export class About {
  pillars: Pillar[] = [
    {
      number: '01',
      title: 'Seasonal Terroir',
      description: 'We partner exclusively with local micro-farms and coastal foragers, letting the rhythm of nature dictate our daily menu.'
    },
    {
      number: '02',
      title: 'Open-Fire Craft',
      description: 'Every dish is kissed by white oak embers, marrying centuries-old culinary techniques with contemporary precision.'
    },
    {
      number: '03',
      title: 'Unscripted Warmth',
      description: 'Hospitality is an art of intuition. We believe fine dining should feel like an intimate evening at a close friend’s table.'
    }
  ];
}
