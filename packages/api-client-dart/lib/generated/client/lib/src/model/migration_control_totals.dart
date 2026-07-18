//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'migration_control_totals.g.dart';

/// MigrationControlTotals
///
/// Properties:
/// * [read] 
/// * [accepted] 
/// * [rejected] 
/// * [created] 
/// * [updated] 
/// * [openingLedgerEntries] 
/// * [controlHash] 
@BuiltValue()
abstract class MigrationControlTotals implements Built<MigrationControlTotals, MigrationControlTotalsBuilder> {
  @BuiltValueField(wireName: r'read')
  int get read;

  @BuiltValueField(wireName: r'accepted')
  int get accepted;

  @BuiltValueField(wireName: r'rejected')
  int get rejected;

  @BuiltValueField(wireName: r'created')
  int? get created;

  @BuiltValueField(wireName: r'updated')
  int? get updated;

  @BuiltValueField(wireName: r'openingLedgerEntries')
  int? get openingLedgerEntries;

  @BuiltValueField(wireName: r'controlHash')
  String? get controlHash;

  MigrationControlTotals._();

  factory MigrationControlTotals([void updates(MigrationControlTotalsBuilder b)]) = _$MigrationControlTotals;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MigrationControlTotalsBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<MigrationControlTotals> get serializer => _$MigrationControlTotalsSerializer();
}

class _$MigrationControlTotalsSerializer implements PrimitiveSerializer<MigrationControlTotals> {
  @override
  final Iterable<Type> types = const [MigrationControlTotals, _$MigrationControlTotals];

  @override
  final String wireName = r'MigrationControlTotals';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    MigrationControlTotals object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'read';
    yield serializers.serialize(
      object.read,
      specifiedType: const FullType(int),
    );
    yield r'accepted';
    yield serializers.serialize(
      object.accepted,
      specifiedType: const FullType(int),
    );
    yield r'rejected';
    yield serializers.serialize(
      object.rejected,
      specifiedType: const FullType(int),
    );
    if (object.created != null) {
      yield r'created';
      yield serializers.serialize(
        object.created,
        specifiedType: const FullType(int),
      );
    }
    if (object.updated != null) {
      yield r'updated';
      yield serializers.serialize(
        object.updated,
        specifiedType: const FullType(int),
      );
    }
    if (object.openingLedgerEntries != null) {
      yield r'openingLedgerEntries';
      yield serializers.serialize(
        object.openingLedgerEntries,
        specifiedType: const FullType(int),
      );
    }
    if (object.controlHash != null) {
      yield r'controlHash';
      yield serializers.serialize(
        object.controlHash,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    MigrationControlTotals object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required MigrationControlTotalsBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'read':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.read = valueDes;
          break;
        case r'accepted':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.accepted = valueDes;
          break;
        case r'rejected':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.rejected = valueDes;
          break;
        case r'created':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.created = valueDes;
          break;
        case r'updated':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.updated = valueDes;
          break;
        case r'openingLedgerEntries':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.openingLedgerEntries = valueDes;
          break;
        case r'controlHash':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.controlHash = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  MigrationControlTotals deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MigrationControlTotalsBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}

