// E2E tests for Set and Map collections
import { describe, it, expect } from 'vitest';
import { parseSource } from '@mcps/transpiler';
import { generateCode } from '@mcps/transpiler';
import { executeInVM } from '@mcps/runtime';

describe('E2E - Collections', () => {
  describe('Set', () => {
    it('should create an empty Set', async () => {
      const source = `
        mySet = Set()
        result = mySet
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBeInstanceOf(Set);
      expect((context.result as Set<unknown>).size).toBe(0);
    });

    it('should create a Set from an array', async () => {
      const source = `
        mySet = Set([1, 2, 3])
        result = mySet
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBeInstanceOf(Set);
      expect((context.result as Set<number>).size).toBe(3);
      expect((context.result as Set<number>).has(1)).toBe(true);
      expect((context.result as Set<number>).has(2)).toBe(true);
      expect((context.result as Set<number>).has(3)).toBe(true);
    });

    it('should automatically deduplicate values', async () => {
      const source = `
        mySet = Set([1, 2, 2, 3, 3, 3])
        result = mySet
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect((context.result as Set<number>).size).toBe(3);
    });

    it('should create a Set from strings', async () => {
      const source = `
        mySet = Set(["apple", "banana", "cherry"])
        result = mySet
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect((context.result as Set<string>).size).toBe(3);
      expect((context.result as Set<string>).has('apple')).toBe(true);
      expect((context.result as Set<string>).has('banana')).toBe(true);
      expect((context.result as Set<string>).has('cherry')).toBe(true);
    });

    it('should work with mixed types', async () => {
      const source = `
        mySet = Set([1, "two", 3, "four"])
        result = mySet
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect((context.result as Set<unknown>).size).toBe(4);
      expect((context.result as Set<unknown>).has(1)).toBe(true);
      expect((context.result as Set<unknown>).has('two')).toBe(true);
    });

    it('should support Set methods via member access', async () => {
      const source = `
        mySet = Set([1, 2, 3])
        hasTwo = mySet.has(2)
        hasFive = mySet.has(5)
        size = mySet.size
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.hasTwo).toBe(true);
      expect(context.hasFive).toBe(false);
      expect(context.size).toBe(3);
    });

    it('should support adding values to Set', async () => {
      const source = `
        mySet = Set([1, 2])
        mySet.add(3)
        mySet.add(4)
        result = mySet.size
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBe(4);
    });

    it('should support deleting values from Set', async () => {
      const source = `
        mySet = Set([1, 2, 3, 4])
        mySet.delete(2)
        mySet.delete(4)
        result = mySet.size
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBe(2);
    });

    it('should support clearing Set', async () => {
      const source = `
        mySet = Set([1, 2, 3, 4, 5])
        mySet.clear()
        result = mySet.size
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBe(0);
    });
  });

  describe('Map', () => {
    it('should create an empty Map', async () => {
      const source = `
        myMap = Map()
        result = myMap
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBeInstanceOf(Map);
      expect((context.result as Map<unknown, unknown>).size).toBe(0);
    });

    it('should create a Map from array of pairs', async () => {
      const source = `
        myMap = Map([["key1", "value1"], ["key2", "value2"]])
        result = myMap
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBeInstanceOf(Map);
      expect((context.result as Map<string, string>).size).toBe(2);
      expect((context.result as Map<string, string>).get('key1')).toBe(
        'value1'
      );
      expect((context.result as Map<string, string>).get('key2')).toBe(
        'value2'
      );
    });

    it('should support getting values from Map', async () => {
      const source = `
        myMap = Map([["name", "Alice"], ["age", 30]])
        name = myMap.get("name")
        age = myMap.get("age")
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.name).toBe('Alice');
      expect(context.age).toBe(30);
    });

    it('should support setting values in Map', async () => {
      const source = `
        myMap = Map()
        myMap.set("name", "Bob")
        myMap.set("age", 25)
        result = myMap.size
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBe(2);
    });

    it('should support checking if Map has a key', async () => {
      const source = `
        myMap = Map([["key1", "value1"]])
        hasKey1 = myMap.has("key1")
        hasKey2 = myMap.has("key2")
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.hasKey1).toBe(true);
      expect(context.hasKey2).toBe(false);
    });

    it('should support deleting entries from Map', async () => {
      const source = `
        myMap = Map([["a", 1], ["b", 2], ["c", 3]])
        myMap.delete("b")
        result = myMap.size
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBe(2);
    });

    it('should support clearing Map', async () => {
      const source = `
        myMap = Map([["a", 1], ["b", 2], ["c", 3]])
        myMap.clear()
        result = myMap.size
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBe(0);
    });

    it('should work with number keys', async () => {
      const source = `
        myMap = Map([[1, "one"], [2, "two"], [3, "three"]])
        value = myMap.get(2)
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.value).toBe('two');
    });

    it('should support overwriting values', async () => {
      const source = `
        myMap = Map([["key", "oldValue"]])
        myMap.set("key", "newValue")
        result = myMap.get("key")
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBe('newValue');
    });
  });

  describe('Real-world use cases', () => {
    it('should use Set to track unique items', async () => {
      const source = `
        items = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
        uniqueItems = Set(items)
        count = uniqueItems.size
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.count).toBe(4);
    });

    it('should use Map as a cache', async () => {
      const source = `
        cache = Map()
        cache.set("user:1", { name: "Alice", age: 30 })
        cache.set("user:2", { name: "Bob", age: 25 })
        
        user1 = cache.get("user:1")
        userName = user1.name
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.userName).toBe('Alice');
    });

    it('should use Map for counting occurrences', async () => {
      const source = `
        counts = Map()
        counts.set("apple", 3)
        counts.set("banana", 5)
        counts.set("cherry", 2)
        
        bananaCount = counts.get("banana")
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.bananaCount).toBe(5);
    });

    it('should use Set for membership testing', async () => {
      const source = `
        allowedUsers = Set(["alice", "bob", "charlie"])
        isAliceAllowed = allowedUsers.has("alice")
        isDaveAllowed = allowedUsers.has("dave")
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.isAliceAllowed).toBe(true);
      expect(context.isDaveAllowed).toBe(false);
    });

    it('should combine Set and Map', async () => {
      const source = `
        userGroups = Map()
        userGroups.set("admins", Set(["alice", "bob"]))
        userGroups.set("users", Set(["charlie", "dave"]))
        
        admins = userGroups.get("admins")
        isAliceAdmin = admins.has("alice")
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.isAliceAdmin).toBe(true);
    });
  });
});
