//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'branch_period.g.dart';

/// BranchPeriod
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [period] 
/// * [status] 
/// * [controlHash] 
/// * [closedAt] 
/// * [version] 
@BuiltValue()
abstract class BranchPeriod implements Built<BranchPeriod, BranchPeriodBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'period')
  String get period;

  @BuiltValueField(wireName: r'status')
  BranchPeriodStatusEnum get status;
  // enum statusEnum {  OPEN,  CLOSING,  CLOSED,  };

  @BuiltValueField(wireName: r'controlHash')
  String get controlHash;

  @BuiltValueField(wireName: r'closedAt')
  DateTime? get closedAt;

  @BuiltValueField(wireName: r'version')
  int get version;

  BranchPeriod._();

  factory BranchPeriod([void updates(BranchPeriodBuilder b)]) = _$BranchPeriod;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BranchPeriodBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BranchPeriod> get serializer => _$BranchPeriodSerializer();
}

class _$BranchPeriodSerializer implements PrimitiveSerializer<BranchPeriod> {
  @override
  final Iterable<Type> types = const [BranchPeriod, _$BranchPeriod];

  @override
  final String wireName = r'BranchPeriod';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BranchPeriod object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'period';
    yield serializers.serialize(
      object.period,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(BranchPeriodStatusEnum),
    );
    yield r'controlHash';
    yield serializers.serialize(
      object.controlHash,
      specifiedType: const FullType(String),
    );
    if (object.closedAt != null) {
      yield r'closedAt';
      yield serializers.serialize(
        object.closedAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    BranchPeriod object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BranchPeriodBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'period':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.period = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BranchPeriodStatusEnum),
          ) as BranchPeriodStatusEnum;
          result.status = valueDes;
          break;
        case r'controlHash':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.controlHash = valueDes;
          break;
        case r'closedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.closedAt = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  BranchPeriod deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BranchPeriodBuilder();
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

class BranchPeriodStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'OPEN')
  static const BranchPeriodStatusEnum OPEN = _$branchPeriodStatusEnum_OPEN;
  @BuiltValueEnumConst(wireName: r'CLOSING')
  static const BranchPeriodStatusEnum CLOSING = _$branchPeriodStatusEnum_CLOSING;
  @BuiltValueEnumConst(wireName: r'CLOSED')
  static const BranchPeriodStatusEnum CLOSED = _$branchPeriodStatusEnum_CLOSED;

  static Serializer<BranchPeriodStatusEnum> get serializer => _$branchPeriodStatusEnumSerializer;

  const BranchPeriodStatusEnum._(String name): super(name);

  static BuiltSet<BranchPeriodStatusEnum> get values => _$branchPeriodStatusEnumValues;
  static BranchPeriodStatusEnum valueOf(String name) => _$branchPeriodStatusEnumValueOf(name);
}

