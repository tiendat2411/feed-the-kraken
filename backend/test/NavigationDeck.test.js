import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import NavigationDeck from '../src/models/NavigationDeck.js';

describe('ENT-004: NavigationDeck Entity Domain Logic & Invariants', () => {
  let quickDeck;
  let longDeck;

  beforeEach(() => {
    quickDeck = new NavigationDeck({ roomId: 'ROOM_Q', mapType: 'QUICK_JOURNEY' });
    longDeck = new NavigationDeck({ roomId: 'ROOM_L', mapType: 'LONG_JOURNEY' });
  });

  test('Deck generation for QUICK_JOURNEY (Total 19 cards)', () => {
    assert.equal(quickDeck.drawPile.length, 19);

    const yellowCards = quickDeck.drawPile.filter(c => c.direction === 'YELLOW');
    const blueCards = quickDeck.drawPile.filter(c => c.direction === 'BLUE');
    const redCards = quickDeck.drawPile.filter(c => c.direction === 'RED');

    assert.equal(yellowCards.length, 5);
    assert.ok(yellowCards.every(c => c.action === 'CULT_UPRISING'));

    assert.equal(blueCards.length, 5);
    assert.equal(blueCards.filter(c => c.action === 'DRUNK').length, 3);
    assert.equal(blueCards.filter(c => c.action === 'DISARMED').length, 2);

    assert.equal(redCards.length, 9);
    assert.equal(redCards.filter(c => c.action === 'DRUNK').length, 5);
    assert.equal(redCards.filter(c => c.action === 'MERMAID').length, 2);
    assert.equal(redCards.filter(c => c.action === 'TELESCOPE').length, 2);
  });

  test('Deck generation for LONG_JOURNEY (Total 23 cards)', () => {
    assert.equal(longDeck.drawPile.length, 23);

    const yellowCards = longDeck.drawPile.filter(c => c.direction === 'YELLOW');
    const blueCards = longDeck.drawPile.filter(c => c.direction === 'BLUE');
    const redCards = longDeck.drawPile.filter(c => c.direction === 'RED');

    assert.equal(yellowCards.length, 6);
    assert.ok(yellowCards.every(c => c.action === 'CULT_UPRISING'));

    assert.equal(blueCards.length, 6);
    assert.equal(blueCards.filter(c => c.action === 'DRUNK').length, 4);
    assert.equal(blueCards.filter(c => c.action === 'DISARMED').length, 2);

    assert.equal(redCards.length, 11);
    assert.equal(redCards.filter(c => c.action === 'ARMED').length, 2);
  });

  test('Drawing cards removes them from drawPile', () => {
    const drawn = quickDeck.draw(2);
    assert.equal(drawn.length, 2);
    assert.equal(quickDeck.drawPile.length, 17);
    assert.ok(drawn[0].id && drawn[0].direction);
  });

  test('Discard pile functionality', () => {
    const drawn = quickDeck.draw(2);
    quickDeck.discard(drawn[0]);
    assert.equal(quickDeck.discardPile.length, 1);

    quickDeck.discard([drawn[1]]);
    assert.equal(quickDeck.discardPile.length, 2);
  });

  test('Logbook lifecycle (Max 2 cards & Shuffle)', () => {
    const [c1, c2, c3] = quickDeck.draw(3);

    quickDeck.addToLogbook(c1);
    quickDeck.addToLogbook(c2);
    assert.equal(quickDeck.logbookCards.length, 2);

    // Cannot add more than 2 cards
    assert.throws(() => {
      quickDeck.addToLogbook(c3);
    }, /Hộp Nhật ký hành trình đã đủ tối đa 2 lá bài/);

    // Shuffle logbook
    quickDeck.shuffleLogbook();
    assert.equal(quickDeck.logbookCards.length, 2);

    // Clear logbook
    quickDeck.clearLogbook();
    assert.equal(quickDeck.logbookCards.length, 0);
  });

  test('Auto-Reshuffle when drawPile runs out (Invariant: does not touch logbook)', () => {
    // Put 1 card in logbook
    const logbookCard = quickDeck.draw(1)[0];
    quickDeck.addToLogbook(logbookCard);

    // Put remaining 18 cards in discardPile
    const remaining = quickDeck.draw(18);
    quickDeck.discard(remaining);
    assert.equal(quickDeck.drawPile.length, 0);
    assert.equal(quickDeck.discardPile.length, 18);

    // Draw 2 cards -> triggers Auto-Reshuffle of discardPile
    const newDrawn = quickDeck.draw(2);
    assert.equal(newDrawn.length, 2);
    assert.equal(quickDeck.drawPile.length, 16);
    assert.equal(quickDeck.discardPile.length, 0);

    // Logbook is untouched
    assert.equal(quickDeck.logbookCards.length, 1);
    assert.equal(quickDeck.logbookCards[0].id, logbookCard.id);
  });

  test('Telescope peekTopDrawPile and Mermaid peekRecentDiscard', () => {
    const topCard = quickDeck.peekTopDrawPile();
    assert.ok(topCard);
    assert.equal(topCard.id, quickDeck.drawPile[0].id);

    // Mermaid peek
    const drawn = quickDeck.draw(4);
    quickDeck.discard(drawn);

    const mermaidCards = quickDeck.peekRecentDiscard(3);
    assert.equal(mermaidCards.length, 3);
  });

  test('Sanitization & Serialization', () => {
    const sanitized = quickDeck.toSanitizedJSON();
    assert.equal(sanitized.drawPileCount, 19);
    assert.equal(sanitized.discardPileCount, 0);
    assert.equal(sanitized.logbookCount, 0);
    assert.equal(sanitized.drawPile, undefined); // Hidden from clients!

    const json = quickDeck.toJSON();
    const restored = NavigationDeck.fromJSON(json);
    assert.equal(restored.drawPile.length, 19);
    assert.equal(restored.mapType, 'QUICK_JOURNEY');
  });
});
