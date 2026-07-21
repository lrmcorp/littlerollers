//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'purchase.g.dart';

/// US-PKG-01 creates PENDING only; approval and ledger mutation are US-PKG-02.
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [userId] 
/// * [packageId] 
/// * [paymentProofId] 
/// * [packageNameSnapshot] 
/// * [priceRpSnapshot] 
/// * [sessionCountSnapshot] 
/// * [durationDaysSnapshot] 
/// * [status] 
/// * [submittedAt] 
/// * [version] 
@BuiltValue()
abstract class Purchase implements Built<Purchase, PurchaseBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'userId')
  String get userId;

  @BuiltValueField(wireName: r'packageId')
  String get packageId;

  @BuiltValueField(wireName: r'paymentProofId')
  String get paymentProofId;

  @BuiltValueField(wireName: r'packageNameSnapshot')
  String get packageNameSnapshot;

  @BuiltValueField(wireName: r'priceRpSnapshot')
  int get priceRpSnapshot;

  @BuiltValueField(wireName: r'sessionCountSnapshot')
  int get sessionCountSnapshot;

  @BuiltValueField(wireName: r'durationDaysSnapshot')
  int get durationDaysSnapshot;

  @BuiltValueField(wireName: r'status')
  JsonObject? get status;

  @BuiltValueField(wireName: r'submittedAt')
  DateTime get submittedAt;

  @BuiltValueField(wireName: r'version')
  int get version;

  Purchase._();

  factory Purchase([void updates(PurchaseBuilder b)]) = _$Purchase;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PurchaseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<Purchase> get serializer => _$PurchaseSerializer();
}

class _$PurchaseSerializer implements PrimitiveSerializer<Purchase> {
  @override
  final Iterable<Type> types = const [Purchase, _$Purchase];

  @override
  final String wireName = r'Purchase';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Purchase object, {
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
    yield r'userId';
    yield serializers.serialize(
      object.userId,
      specifiedType: const FullType(String),
    );
    yield r'packageId';
    yield serializers.serialize(
      object.packageId,
      specifiedType: const FullType(String),
    );
    yield r'paymentProofId';
    yield serializers.serialize(
      object.paymentProofId,
      specifiedType: const FullType(String),
    );
    yield r'packageNameSnapshot';
    yield serializers.serialize(
      object.packageNameSnapshot,
      specifiedType: const FullType(String),
    );
    yield r'priceRpSnapshot';
    yield serializers.serialize(
      object.priceRpSnapshot,
      specifiedType: const FullType(int),
    );
    yield r'sessionCountSnapshot';
    yield serializers.serialize(
      object.sessionCountSnapshot,
      specifiedType: const FullType(int),
    );
    yield r'durationDaysSnapshot';
    yield serializers.serialize(
      object.durationDaysSnapshot,
      specifiedType: const FullType(int),
    );
    yield r'status';
    yield object.status == null ? null : serializers.serialize(
      object.status,
      specifiedType: const FullType.nullable(JsonObject),
    );
    yield r'submittedAt';
    yield serializers.serialize(
      object.submittedAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    Purchase object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PurchaseBuilder result,
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
        case r'userId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.userId = valueDes;
          break;
        case r'packageId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.packageId = valueDes;
          break;
        case r'paymentProofId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.paymentProofId = valueDes;
          break;
        case r'packageNameSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.packageNameSnapshot = valueDes;
          break;
        case r'priceRpSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.priceRpSnapshot = valueDes;
          break;
        case r'sessionCountSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sessionCountSnapshot = valueDes;
          break;
        case r'durationDaysSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.durationDaysSnapshot = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(JsonObject),
          ) as JsonObject?;
          if (valueDes == null) continue;
          result.status = valueDes;
          break;
        case r'submittedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.submittedAt = valueDes;
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
  Purchase deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PurchaseBuilder();
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

