import GameCanvas from '@/components/game-components/game-canvas';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quickplay - AimGravity',
  description: 'Test your aim with our blazing fast WebGL engine'
};

export default function QuickplayPage() {
  return <GameCanvas />;
}
