package ast;
import java.util.*;

/**
 * @author SOON WEI JUN A0156192A
 * This class is mainly for construction of AST nodes representing a dictionary in a Python
 * Program and its respective syntax generation
 *
 */
public class ASTExpressionUnitLiteralDictionary extends ASTExpressionUnitLiteral{
	private static final String NODE_TYPE = "Dictionary";
	private ArrayList<ASTExpressionUnitLiteral> keys;
	private ArrayList<ASTExpression> values;
	
	public ASTExpressionUnitLiteralDictionary(){
		super();
		initialize();
	}

	public void addValue(ASTExpressionUnitLiteral key, ASTExpression value){
		this.keys.add(key);
		this.values.add(value);
		key.parent = this;
		value.parent = this;
	}
	private void initialize() {
		this.keys = new ArrayList<ASTExpressionUnitLiteral>();
		this.values = new ArrayList<ASTExpression>();
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
	
	public String toSyntax() {
		this.result = "";
		this.result += "{";
		for(int i = 0; i < this.keys.size(); i++){
			this.result+= this.keys.get(i).toSyntax() + " : " + this.values.get(i).toSyntax();
			if(i < this.keys.size()-1) this.result+= ", ";
		}
		this.result += "}";
		if(this.isQuoted) quote();
		return this.result;		
	}
}
