//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'dashboard_queue_summary.g.dart';

/// DashboardQueueSummary
///
/// Properties:
/// * [key] 
/// * [label] 
/// * [count] 
/// * [href] 
@BuiltValue()
abstract class DashboardQueueSummary implements Built<DashboardQueueSummary, DashboardQueueSummaryBuilder> {
  @BuiltValueField(wireName: r'key')
  String get key;

  @BuiltValueField(wireName: r'label')
  String get label;

  @BuiltValueField(wireName: r'count')
  int get count;

  @BuiltValueField(wireName: r'href')
  String get href;

  DashboardQueueSummary._();

  factory DashboardQueueSummary([void updates(DashboardQueueSummaryBuilder b)]) = _$DashboardQueueSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DashboardQueueSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DashboardQueueSummary> get serializer => _$DashboardQueueSummarySerializer();
}

class _$DashboardQueueSummarySerializer implements PrimitiveSerializer<DashboardQueueSummary> {
  @override
  final Iterable<Type> types = const [DashboardQueueSummary, _$DashboardQueueSummary];

  @override
  final String wireName = r'DashboardQueueSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DashboardQueueSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'key';
    yield serializers.serialize(
      object.key,
      specifiedType: const FullType(String),
    );
    yield r'label';
    yield serializers.serialize(
      object.label,
      specifiedType: const FullType(String),
    );
    yield r'count';
    yield serializers.serialize(
      object.count,
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
    DashboardQueueSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DashboardQueueSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'key':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.key = valueDes;
          break;
        case r'label':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.label = valueDes;
          break;
        case r'count':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.count = valueDes;
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
  DashboardQueueSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DashboardQueueSummaryBuilder();
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

