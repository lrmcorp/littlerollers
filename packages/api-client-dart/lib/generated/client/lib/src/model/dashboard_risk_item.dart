//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'dashboard_risk_item.g.dart';

/// DashboardRiskItem
///
/// Properties:
/// * [id] 
/// * [branchName] 
/// * [branchCode] 
/// * [className] 
/// * [startAt] 
/// * [bookedCount] 
/// * [minimumQuota] 
/// * [capacity] 
/// * [href] 
@BuiltValue()
abstract class DashboardRiskItem implements Built<DashboardRiskItem, DashboardRiskItemBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchName')
  String get branchName;

  @BuiltValueField(wireName: r'branchCode')
  String get branchCode;

  @BuiltValueField(wireName: r'className')
  String get className;

  @BuiltValueField(wireName: r'startAt')
  DateTime get startAt;

  @BuiltValueField(wireName: r'bookedCount')
  int get bookedCount;

  @BuiltValueField(wireName: r'minimumQuota')
  int get minimumQuota;

  @BuiltValueField(wireName: r'capacity')
  int get capacity;

  @BuiltValueField(wireName: r'href')
  String get href;

  DashboardRiskItem._();

  factory DashboardRiskItem([void updates(DashboardRiskItemBuilder b)]) = _$DashboardRiskItem;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DashboardRiskItemBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DashboardRiskItem> get serializer => _$DashboardRiskItemSerializer();
}

class _$DashboardRiskItemSerializer implements PrimitiveSerializer<DashboardRiskItem> {
  @override
  final Iterable<Type> types = const [DashboardRiskItem, _$DashboardRiskItem];

  @override
  final String wireName = r'DashboardRiskItem';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DashboardRiskItem object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'branchName';
    yield serializers.serialize(
      object.branchName,
      specifiedType: const FullType(String),
    );
    yield r'branchCode';
    yield serializers.serialize(
      object.branchCode,
      specifiedType: const FullType(String),
    );
    yield r'className';
    yield serializers.serialize(
      object.className,
      specifiedType: const FullType(String),
    );
    yield r'startAt';
    yield serializers.serialize(
      object.startAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'bookedCount';
    yield serializers.serialize(
      object.bookedCount,
      specifiedType: const FullType(int),
    );
    yield r'minimumQuota';
    yield serializers.serialize(
      object.minimumQuota,
      specifiedType: const FullType(int),
    );
    yield r'capacity';
    yield serializers.serialize(
      object.capacity,
      specifiedType: const FullType(int),
    );
    yield r'href';
    yield serializers.serialize(
      object.href,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    DashboardRiskItem object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DashboardRiskItemBuilder result,
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
        case r'branchName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchName = valueDes;
          break;
        case r'branchCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchCode = valueDes;
          break;
        case r'className':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.className = valueDes;
          break;
        case r'startAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.startAt = valueDes;
          break;
        case r'bookedCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.bookedCount = valueDes;
          break;
        case r'minimumQuota':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.minimumQuota = valueDes;
          break;
        case r'capacity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.capacity = valueDes;
          break;
        case r'href':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.href = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  DashboardRiskItem deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DashboardRiskItemBuilder();
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

